import { getSingleProduct } from "@/lib/shopify/product.query";
import { notFound } from "next/navigation";
import ProductForm from "./ProductForm";
import ImageGallery from "./ImageGallery";

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const product = await getSingleProduct(params.handle);

  if (!product) {
    notFound();
  }

  // Flatten the images
  const images = product.images.edges.map((edge: any) => edge.node);

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left Column - Images */}
          <ImageGallery images={images} />

          {/* Right Column - Details */}
          <div className="lg:py-8">
            <div className="space-y-4 border-b border-black/5 pb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#737373]">
                Highline Industry
              </p>
              <h1 className="text-3xl md:text-5xl font-sora font-semibold text-[#0a0a0a] tracking-tight">
                {product.title}
              </h1>
              <p className="text-xl font-semibold text-[#111]">
                {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
              </p>
            </div>

            <div className="py-8 border-b border-black/5">
              <div
                className="prose prose-sm md:prose-base text-[#737373] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>

            <div className="py-8">
              <ProductForm product={product} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
