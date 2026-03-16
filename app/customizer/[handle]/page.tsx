import { getSingleProduct } from "@/lib/shopify/product.query"
import { notFound } from "next/navigation";
import { getCustomizerConfig } from "@/app/actions/admin";
import StoreProvider from "@/lib/store/provider";
import CustomizerApp from "./customizer-app";

const CustomizerPage = async (props: {
    params: Promise<{ handle: string }>;
}) => {
    const params = await props.params;
    const product = await getSingleProduct(params.handle);

    if (!product) {
        notFound();
    }
    const [configResult] = await Promise.all([
        getCustomizerConfig(`gid://shopify/Product/${product.id.split("/").pop() || ""}`)
    ]);

    return (
        <StoreProvider>
            <CustomizerApp product={product} configResult={configResult} />
        </StoreProvider>
    )
}

export default CustomizerPage;