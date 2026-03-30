import { getSingleProduct } from "@/lib/shopify/product.query"
import { notFound } from "next/navigation";
import { getCustomizerConfig } from "@/app/actions/admin";
import CustomizerApp from "./customizer-app";
import { db } from "@/db";
import { userDesigns } from "@/db/schemas/product-customization.schema";
import { createServerClient } from "@/lib/supabase/server-client";
import { and, eq } from "drizzle-orm";

const CustomizerPage = async (props: {
    params: Promise<{ handle: string }>;
    searchParams: Promise<{ designId?: string }>;
}) => {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const product = await getSingleProduct(params.handle);

    if (!product) {
        notFound();
    }

    const { designId } = searchParams;
    let initialDesign = null;

    if (designId) {
        const supabase = await createServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            const result = await db
                .select()
                .from(userDesigns)
                .where(and(eq(userDesigns.userId, session.user.id), eq(userDesigns.id, designId)))
                .limit(1);

            if (result.length > 0) {
                initialDesign = result[0];
            }
        }
    }

    const [configResult] = await Promise.all([
        getCustomizerConfig(`gid://shopify/Product/${product.id.split("/").pop() || ""}`)
    ]);

    return (
        <CustomizerApp 
            product={product} 
            configResult={configResult} 
            initialDesign={initialDesign} 
        />
    )
}

export default CustomizerPage;