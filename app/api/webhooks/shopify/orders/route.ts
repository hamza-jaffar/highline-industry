import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders, orderItems, userDesigns } from "@/db/schemas/product-customization.schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin-client";
import { eq, inArray } from "drizzle-orm";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

    if (!hmacHeader || !SHOPIFY_WEBHOOK_SECRET) {
      console.error("Missing HMAC header or SHOPIFY_WEBHOOK_SECRET");
      return NextResponse.json({ message: "Invalid configuration" }, { status: 200 });
    }

    const hash = crypto
      .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (hash !== hmacHeader) {
      console.error("HMAC verification failed");
      return NextResponse.json({ message: "Unauthorized" }, { status: 200 });
    }

    const payload = JSON.parse(rawBody);
    const shopifyOrderId = payload.id.toString();
    const shopifyOrderNumber = payload.order_number?.toString() || payload.name;
    const customerEmail = payload.customer?.email;
    const customerName = `${payload.customer?.first_name || ""} ${payload.customer?.last_name || ""}`.trim();
    const totalPrice = Math.round(parseFloat(payload.total_price) * 100);
    const currency = payload.currency;
    const shippingAddress = payload.shipping_address ? JSON.stringify(payload.shipping_address) : null;

    let userId: string | null = null;
    const lineItems = payload.line_items || [];

    // Extract design IDs from properties/attributes
    const designIds = lineItems
      .map((item: any) => {
        const prop = item.properties?.find((p: any) => p.name === "_design_id");
        return prop?.value;
      })
      .filter(Boolean);

    if (designIds.length > 0) {
      const designRecords = await db.select({ userId: userDesigns.userId }).from(userDesigns).where(inArray(userDesigns.id, designIds)).limit(1);
      if (designRecords.length > 0) {
        userId = designRecords[0].userId;
      }
    }

    // Fallback to customer email
    if (!userId && customerEmail) {
      const supabase = getSupabaseAdmin();
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users.find((u) => u.email === customerEmail);
      if (user) userId = user.id;
    }

    if (!userId) {
      console.warn("Could not determine user for order:", shopifyOrderId);
      return NextResponse.json({ message: "User not found" }, { status: 200 });
    }

    // 2. Store Order
    const [insertedOrder] = await db.insert(orders).values({
      userId: userId,
      shopifyOrderId: shopifyOrderId,
      shopifyOrderNumber: shopifyOrderNumber,
      totalPrice: totalPrice,
      currency: currency,
      status: "Pending",
      customerEmail: customerEmail,
      customerName: customerName,
      shippingAddress: shippingAddress,
    }).onConflictDoNothing({ target: orders.shopifyOrderId }).returning();

    let orderIdToUse: string | undefined = insertedOrder?.id;
    if (!orderIdToUse) {
      const existing = await db.query.orders.findFirst({
        where: eq(orders.shopifyOrderId, shopifyOrderId)
      });
      orderIdToUse = existing?.id;
    }

    if (!orderIdToUse) {
      throw new Error("Failed to create or find order");
    }

    // 3. Store Order Items
    for (const item of lineItems) {
      const designId = item.properties?.find((p: any) => p.name === "_design_id")?.value || null;
      const color = item.properties?.find((p: any) => p.name === "Color")?.value || null;
      const size = item.properties?.find((p: any) => p.name === "Size")?.value || null;

      await db.insert(orderItems).values({
        orderId: orderIdToUse,
        productId: item.product_id?.toString() || "",
        variantId: item.variant_id?.toString() || "",
        designId: designId,
        quantity: item.quantity,
        price: Math.round(parseFloat(item.price) * 100),
        isDesigned: !!designId,
        productTitle: item.title,
        variantTitle: item.variant_title,
        color: color,
        size: size,
      });
    }

    return NextResponse.json({ success: true, orderId: orderIdToUse });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 200 });
  }
}
