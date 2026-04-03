import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateOrders, affiliateCommissions, affiliateProductAssignments } from "@/db/schemas/affiliate.schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Verify Shopify Webhook HMAC using SHA256 (if secret provided)
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (shopifySecret && hmacHeader) {
      const generatedHash = crypto
        .createHmac("sha256", shopifySecret)
        .update(rawBody, "utf8")
        .digest("base64");
      
      if (generatedHash !== hmacHeader) {
        return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
      }
    }

    const order = JSON.parse(rawBody);
    
    // 2. Extract Affiliate ID from note_attributes or line_items
    let affiliateId: string | null = null;

    // Check line items first (since we attached it there via DraftOrders cart)
    for (const item of order.line_items || []) {
      const affAttr = item.properties?.find((p: any) => p.name === "_affiliate_id" || p.key === "_affiliate_id");
      if (affAttr) {
        affiliateId = affAttr.value;
        break;
      }
    }

    // Check order level notes just in case
    if (!affiliateId && order.note_attributes) {
      const affAttr = order.note_attributes.find((attr: any) => attr.name === "_affiliate_id" || attr.key === "_affiliate_id");
      if (affAttr) {
        affiliateId = affAttr.value;
      }
    }

    if (!affiliateId) {
      return NextResponse.json({ message: "No affiliate attached to this order." });
    }

    // 3. Find the Affiliate in the DB
    const affiliateRecords = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, affiliateId));
    if (!affiliateRecords.length) {
      return NextResponse.json({ message: "Affiliate not found." });
    }

    const affiliate = affiliateRecords[0];

    // Check if affiliate is banned/suspended
    if (affiliate.status !== "approved") {
      return NextResponse.json({ message: "Affiliate is not active. No commission generated." });
    }

    // 4. Calculate Commission per line item
    let totalCommission = 0;
    const defaultRate = parseFloat(affiliate.defaultCommissionRate as string) / 100;

    // Fetch potential assignments specifically for this affiliate
    const assignments = await db.select()
      .from(affiliateProductAssignments)
      .where(eq(affiliateProductAssignments.affiliateId, affiliate.id));

    for (const item of order.line_items) {
      const itemPrice = parseFloat(item.price);
      const quantity = item.quantity || 1;
      const subTotal = itemPrice * quantity;

      // Extract Shopify product handle to check overrides (if any)
      // Usually product tags or handle are not strictly available in raw webhook line items, but we can match via product_id if handle isn't present
      const overrideRecord = assignments.find(a => a.productHandle === item.product_id?.toString() || a.productHandle === item.handle);
      
      const appliedRate = overrideRecord 
        ? parseFloat(overrideRecord.overrideCommissionRate as string) / 100 
        : defaultRate;

      totalCommission += (subTotal * appliedRate);
    }

    // 5. Store Logic
    // Step A: Save the Order link
    const [{ insertId: orderTId }] = await db.insert(affiliateOrders).values({
      affiliateId: affiliate.id,
      shopifyOrderId: order.id.toString(),
      orderSubtotal: parseFloat(order.subtotal_price).toString(),
      customerEmail: order.email || "guest@anonymous.com",
    }).returning({ insertId: affiliateOrders.id });

    // Step B: Issue the generated Commission entry representing outstanding cash owed
    if (totalCommission > 0) {
      await db.insert(affiliateCommissions).values({
        affiliateId: affiliate.id,
        orderId: orderTId,
        amount: totalCommission.toFixed(2),
        status: "pending",
      });
    }

    return NextResponse.json({ success: true, commissionLogged: totalCommission });
    
  } catch (err: any) {
    console.error("Shopify Affiliate Webhook Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
