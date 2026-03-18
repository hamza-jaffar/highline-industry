import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { userDesigns } from "@/db/schemas/product-customization.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { eq, desc, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, productId, productHandle, color, elements, name, price } = body;

        if (!productId || !color || !elements) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = session.user.id;

        if (id) {
            const result = await db
                .update(userDesigns)
                .set({
                    name: name || `${productHandle} - ${color}`,
                    elements: JSON.stringify(elements),
                    price: price ? Math.round(parseFloat(price) * 100) : undefined,
                    updatedAt: new Date(),
                })
                .where(and(eq(userDesigns.id, id), eq(userDesigns.userId, userId)))
                .returning();

            if (result.length === 0) {
                return NextResponse.json({ error: "Design not found or unauthorized" }, { status: 404 });
            }

            return NextResponse.json({ success: true, design: result[0] });
        }

        const result = await db.insert(userDesigns).values({
            userId,
            productId,
            productHandle,
            color,
            name: name || `${productHandle} - ${color}`,
            elements: JSON.stringify(elements),
            price: price ? Math.round(parseFloat(price) * 100) : 0,
        }).returning();

        return NextResponse.json({ success: true, design: result[0] });

    } catch (error) {
        console.error("Error saving user design:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const designId = searchParams.get('id');

        if (designId) {
            const result = await db
                .select()
                .from(userDesigns)
                .where(and(eq(userDesigns.userId, userId), eq(userDesigns.id, designId)))
                .limit(1);

            if (result.length === 0) {
                return NextResponse.json({ error: "Design not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, design: result[0] });
        }

        const designs = await db
            .select()
            .from(userDesigns)
            .where(eq(userDesigns.userId, userId))
            .orderBy(desc(userDesigns.updatedAt));

        return NextResponse.json({ success: true, designs });

    } catch (error) {
        console.error("Error fetching user designs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
