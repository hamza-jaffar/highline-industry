import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateClicks } from "@/db/schemas/affiliate.schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
    }

    // Find the affiliate by code
    const affiliateRecord = await db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.affiliateCode, code))
      .limit(1);

    if (affiliateRecord.length === 0) {
      return NextResponse.json({ error: "Invalid affiliate code" }, { status: 404 });
    }

    // Log the click
    // We try to get the IP, though in many cloud envs this might be in headers
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    await db.insert(affiliateClicks).values({
      affiliateId: affiliateRecord[0].id,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
