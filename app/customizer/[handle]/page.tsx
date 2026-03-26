import { getSingleProduct } from "@/lib/shopify/product.query"
import { notFound } from "next/navigation";
import { getCustomizerConfig } from "@/app/actions/admin";
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
        <CustomizerApp product={product} configResult={configResult} />
    )
}

export default CustomizerPage;