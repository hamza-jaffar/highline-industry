import { getSingleProduct } from "@/lib/shopify/product.query"
import { notFound } from "next/navigation";
import CustomizerLeftSidebar from "./left-sidebar";
import CustomizerRightSidebar from "./right-sidebar";
import CustomizerHeader from "./header";
import CenterCanvas from "./canvas";
import { getCustomizerConfig } from "@/app/actions/admin";

const CustomizerPage = async (props: {
    params: Promise<{ handle: string }>;
}) => {
    const params = await props.params;
    const product = await getSingleProduct(params.handle);

    if (!product) {
        notFound();
    }

    const configration = await getCustomizerConfig(product.id.split("/").pop() || "");

    console.log(configration);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Global Header */}
            <CustomizerHeader />

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden">
                {/* Navigation & Assets */}
                <CustomizerLeftSidebar />

                {/* Visual Workspace */}
                <CenterCanvas />

                {/* Transformer / Attributes */}
                <CustomizerRightSidebar />
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.1);
                }
            `}} />
        </div>
    )
}

export default CustomizerPage;