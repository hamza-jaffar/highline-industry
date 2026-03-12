"use client";

import { useState } from "react";

export default function ProductForm({ product }: { product: any }) {
  // Collect unique options (e.g., Size, Color)
  const allOptions: Record<string, string[]> = {};
  
  product.variants.edges.forEach(({ node: variant }: any) => {
    variant.selectedOptions.forEach((opt: any) => {
      if (!allOptions[opt.name]) {
        allOptions[opt.name] = [];
      }
      if (!allOptions[opt.name].includes(opt.value)) {
        allOptions[opt.name].push(opt.value);
      }
    });
  });

  // Keep track of selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(allOptions).forEach((key) => {
      initial[key] = allOptions[key][0]; // default to first available
    });
    return initial;
  });

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  // Find the matching variant
  const selectedVariant = product.variants.edges.find(({ node: variant }: any) => {
    return variant.selectedOptions.every(
      (opt: any) => selectedOptions[opt.name] === opt.value
    );
  })?.node;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    console.log("Adding to cart:", selectedVariant.id);
    // TODO: Integrate actual Shopify Cart API
    alert(`Added ${product.title} (${Object.values(selectedOptions).join(" / ")}) to cart!`);
  };

  return (
    <div className="space-y-8">
      {Object.keys(allOptions).map((optionName) => (
        <div key={optionName} className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#111]">{optionName}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {allOptions[optionName].map((value) => {
              const isActive = selectedOptions[optionName] === value;
              return (
                <button
                  key={value}
                  onClick={() => handleOptionChange(optionName, value)}
                  className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-[#111] hover:border-black/30 hover:bg-[#fafafa]"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant?.availableForSale}
        className={`w-full py-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          selectedVariant?.availableForSale
            ? "bg-[#111] text-white hover:bg-black"
            : "bg-black/5 text-[#737373] cursor-not-allowed"
        }`}
      >
        {selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
