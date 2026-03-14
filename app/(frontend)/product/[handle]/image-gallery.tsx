"use client";

import { useState, useEffect } from "react";

export default function ImageGallery({
  images,
  variantImage,
}: {
  images: { url: string; altText?: string }[];
  variantImage?: { url: string; altText?: string } | null;
}) {
  const [activeImage, setActiveImage] = useState(variantImage || images[0]);

  useEffect(() => {
    if (variantImage && variantImage.url) {
      setActiveImage(variantImage);
    } else if (images && images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [variantImage, images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-black/5 rounded-2xl flex items-center justify-center">
        <span className="text-sm font-semibold text-muted">No Image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="w-full aspect-[4/5] bg-[#ebebeb] rounded-2xl overflow-hidden relative">
        <img
          src={activeImage.url}
          alt={activeImage.altText || "Product Image"}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeImage.url === img.url ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || `Thumbnail ${i}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
