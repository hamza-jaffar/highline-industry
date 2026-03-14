"use client";

import { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import ImageGallery from "./ImageGallery";

export default function ProductPageClient({ product, images }: { product: any; images: { url: string; altText?: string }[] }) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (!selectedVariant && product.variants?.edges?.length) {
      // initialize with first variant if not set
      setSelectedVariant(product.variants.edges[0]?.node);
    }
  }, [selectedVariant, product.variants]);

  const variantImage = selectedVariant?.image
    ? { url: selectedVariant.image.url, altText: selectedVariant.image.altText }
    : null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left Column - Images */}
          <ImageGallery images={images} variantImage={variantImage} />

          {/* Right Column - Details */}
          <div className="lg:py-8">
            <div className="space-y-4 border-b border-black/5 pb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted">Highline Industry</p>
              <h1 className="text-3xl md:text-5xl font-sora font-semibold text-[#0a0a0a] tracking-tight">
                {product.title}
              </h1>
            </div>

            <div className="py-8 border-b border-black/5">
              <div
                className="prose prose-sm md:prose-base text-muted leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>

            <div className="py-8">
              <ProductForm product={product} onVariantSelect={setSelectedVariant} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
