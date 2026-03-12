"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Heavyweight Boxy Tee", category: "Tops", price: 45, colors: ["Black", "Vintage White", "Bone"] },
  { id: 2, name: "Relaxed Fit Hoodie", category: "Outerwear", price: 85, colors: ["Onyx", "Sand"] },
  { id: 3, name: "Canvas Work Jacket", category: "Outerwear", price: 120, colors: ["Charcoal"] },
  { id: 4, name: "Selvedge Denim", category: "Bottoms", price: 110, colors: ["Indigo"] },
  { id: 5, name: "Micro-Rib Tank", category: "Tops", price: 35, colors: ["White", "Black"] },
  { id: 6, name: "Oversized Sweatshirt", category: "Outerwear", price: 75, colors: ["Slate", "Cream"] },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="flex flex-col w-full min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 mt-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-sora font-semibold text-[#111] tracking-tight">The Catalog</h1>
          <p className="text-[#737373] text-sm">Engineered garments for modern brands.</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm">
            Sort by
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Desktop & Mobile */}
      <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2 border-b border-black/5">
        {["All", "Outerwear", "Tops", "Bottoms", "Accessories"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? "bg-black text-white" 
                : "text-[#737373] hover:text-black hover:bg-black/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
        {PRODUCTS.map((product) => (
          <Link 
            key={product.id} 
            href={`/product/${product.id}`}
            className="group block space-y-4"
          >
            {/* Product Image Wrapper */}
            <div className="relative aspect-[4/5] bg-white border border-black/10 rounded-xl overflow-hidden transition-all group-hover:shadow-elevated group-hover:border-black/20">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-[#fafafa]/50 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center text-black/5 font-black text-9xl select-none group-hover:scale-105 transition-transform duration-500">
                {product.name[0]}
              </div>
              
              {/* Hover Quick Add */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <button className="w-full py-2.5 bg-white border border-black/10 rounded-md text-[#111] text-xs font-semibold shadow-sm hover:bg-black hover:text-white hover:border-black transition-all">
                  Quick Add
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#737373]">
                  {product.category}
                </p>
                <h3 className="text-sm font-semibold text-[#111]">
                  {product.name}
                </h3>
              </div>
              <p className="font-semibold text-sm text-[#111]">
                ${product.price}
              </p>
            </div>
            
            <div className="flex gap-1.5 pt-1">
              {product.colors.map(color => (
                <span 
                  key={color} 
                  className="w-3 h-3 rounded-full border border-black/10 shadow-inner" 
                  style={{ backgroundColor: color === 'Vintage White' ? '#fdfbf7' : color === 'Bone' ? '#e3dac7' : color === 'Onyx' ? '#222' : color === 'Sand' ? '#c2b29f' : color === 'Charcoal' ? '#333' : color === 'Indigo' ? '#1c223a' : color === 'Slate' ? '#4f5b66' : color === 'Cream' ? '#f5f5f0' : color.toLowerCase() }}
                  title={color} 
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
