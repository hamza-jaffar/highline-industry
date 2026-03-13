"use client";

import { useState, useMemo } from "react";

type Variant = {
  id: string;
  title: string;
  price: string;
  inventoryQuantity: number;
  availableForSale?: boolean;
  selectedOptions: { name: string; value: string }[];
};

export default function ProductForm({ product }: { product: any }) {
  const variants: Variant[] = product.variants.edges.map(({ node }: any) => node);

  // Collect all unique option names IN ORDER (e.g. ["Color", "Size"])
  const optionNames: string[] = useMemo(() => {
    const names: string[] = [];
    variants.forEach((v) => {
      v.selectedOptions.forEach((opt) => {
        if (!names.includes(opt.name)) names.push(opt.name);
      });
    });
    return names;
  }, [variants]);

  // Default: first value for each option
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    optionNames.forEach((name) => {
      const firstVariant = variants.find((v) =>
        v.selectedOptions.some((o) => o.name === name)
      );
      const firstValue = firstVariant?.selectedOptions.find((o) => o.name === name)?.value || "";
      initial[name] = firstValue;
    });
    return initial;
  });

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => {
      const updated = { ...prev, [name]: value };
      // After changing this option, check if the current selection still matches a variant.
      // If not, reset subsequent options to the first available value.
      const idx = optionNames.indexOf(name);
      for (let i = idx + 1; i < optionNames.length; i++) {
        const nextName = optionNames[i];
        const available = getAvailableValues(nextName, updated);
        if (!available.has(updated[nextName])) {
          updated[nextName] = Array.from(available)[0] || "";
        }
      }
      return updated;
    });
  };

  // Get all possible values for an option given the CURRENTLY selected options
  // Only considers options that come BEFORE this option in the option order
  const getAvailableValues = (
    optionName: string,
    currentSelection: Record<string, string> = selectedOptions
  ): Set<string> => {
    const precedingNames = optionNames.slice(0, optionNames.indexOf(optionName));
    return new Set(
      variants
        .filter((v) =>
          precedingNames.every((pre) =>
            v.selectedOptions.some(
              (o) => o.name === pre && o.value === currentSelection[pre]
            )
          )
        )
        .flatMap((v) =>
          v.selectedOptions.filter((o) => o.name === optionName).map((o) => o.value)
        )
    );
  };

  // Find the exactly matching variant
  const selectedVariant: Variant | undefined = useMemo(() => {
    return variants.find((v) =>
      v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
    );
  }, [selectedOptions, variants]);

  const isInStock =
    selectedVariant &&
    (selectedVariant.inventoryQuantity > 0 || selectedVariant.availableForSale);

  const displayPrice = selectedVariant?.price
    ? `${parseFloat(selectedVariant.price).toFixed(2)}`
    : product.priceRange?.minVariantPrice?.amount || "—";
  
  const currency = product.priceRange?.minVariantPrice?.currencyCode || "";

  const handleAddToCart = () => {
    if (!selectedVariant || !isInStock) return;
    alert(
      `Added ${product.title} (${Object.values(selectedOptions).join(" / ")}) to cart!`
    );
  };

  return (
    <div className="space-y-8">
      {/* Reactive Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#111]">
          {displayPrice} {currency}
        </span>
        {selectedVariant && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isInStock
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-600 bg-red-50"
            }`}
          >
            {isInStock
              ? `In Stock${selectedVariant.inventoryQuantity > 0 ? ` (${selectedVariant.inventoryQuantity})` : ""}`
              : "Out of Stock"}
          </span>
        )}
      </div>

      {/* Option Selectors */}
      {optionNames.map((optionName) => {
        const availableValues = getAvailableValues(optionName);
        // All unique values for this option across ALL variants
        const allValues = [
          ...new Set(
            variants.flatMap((v) =>
              v.selectedOptions.filter((o) => o.name === optionName).map((o) => o.value)
            )
          ),
        ];

        return (
          <div key={optionName} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#111]">{optionName}</span>
              <span className="text-xs text-muted">
                {selectedOptions[optionName]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allValues.map((value) => {
                const isActive = selectedOptions[optionName] === value;
                const isAvailable = availableValues.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && handleOptionChange(optionName, value)}
                    disabled={!isAvailable}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all relative ${
                      isActive
                        ? "border-black bg-black text-white shadow-sm"
                        : isAvailable
                        ? "border-black/10 bg-white text-[#111] hover:border-black/30 hover:bg-surface"
                        : "border-black/5 bg-surface text-black/20 cursor-not-allowed line-through"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={handleAddToCart}
        disabled={!isInStock}
        className={`w-full py-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          isInStock
            ? "bg-[#111] text-white hover:bg-black"
            : "bg-black/5 text-muted cursor-not-allowed"
        }`}
      >
        {!selectedVariant
          ? "Select Options"
          : isInStock
          ? "Add to Cart"
          : "Out of Stock"}
      </button>
    </div>
  );
}
