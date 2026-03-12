"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Heavyweight Boxy Tee", category: "Tops", price: 45, colors: ["Black", "Vintage White", "Bone"] },
  { id: 2, name: "Relaxed Fit Hoodie", category: "Outerwear", price: 85, colors: ["Onyx", "Sand"] },
  { id: 3, name: "Canvas Work Jacket", category: "Outerwear", price: 120, colors: ["Charcoal"] },
  { id: 4, name: "Selvedge Denim", category: "Bottoms", price: 110, colors: ["Indigo"] },
  { id: 5, name: "Micro-Rib Tank", category: "Tops", price: 35, colors: ["White", "Black"] },
  { id: 6, name: "Oversized Sweatshirt", category: "Outerwear", price: 75, colors: ["Slate", "Cream"] },
];

const SORT_OPTIONS = [
  "Featured",
  "Newest Arrivals",
  "Price: Low to High",
  "Price: High to Low"
];

const FILTER_CATEGORIES = ["All", "Outerwear", "Tops", "Bottoms", "Accessories"];

const FILTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FILTER_COLORS = [
  { name: "Black", hex: "#222" },
  { name: "White", hex: "#fdfbf7" },
  { name: "Neutral", hex: "#c2b29f" },
  { name: "Navy", hex: "#1c223a" }
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Featured");
  
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isFilterOpen]);

  return (
    <>
      <div className="flex flex-col w-full min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 mt-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-sora font-semibold text-[#111] tracking-tight">The Catalog</h1>
            <p className="text-[#737373] text-sm">Engineered garments for modern brands.</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            
            <div className="relative" ref={sortRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-md text-sm font-medium text-black bg-white hover:bg-black/5 transition-colors shadow-sm"
              >
                Sort by: {activeSort.split(':')[0]}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Sort Dropdown */}
              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-black/10 rounded-lg shadow-elevated z-40 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveSort(option);
                        setIsSortOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#111] hover:bg-[#fafafa] flex items-center justify-between"
                    >
                      {option}
                      {activeSort === option && <Check className="w-4 h-4 text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Desktop & Mobile */}
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-2 border-b border-black/5">
          {FILTER_CATEGORIES.map((cat) => (
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
              <div className="relative aspect-[4/5] bg-white border border-black/10 rounded-xl overflow-hidden transition-all group-hover:shadow-elevated group-hover:border-black/20">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-[#fafafa]/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center text-black/5 font-black text-9xl select-none group-hover:scale-105 transition-transform duration-500">
                  {product.name[0]}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <button className="w-full py-2.5 bg-white border border-black/10 rounded-md text-[#111] text-xs font-semibold shadow-sm hover:bg-black hover:text-white hover:border-black transition-all">
                    Quick Add
                  </button>
                </div>
              </div>

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

      {/* Filter Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm transition-opacity duration-300 flex justify-end ${
          isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFilterOpen(false)}
      >
        {/* Sidebar Panel */}
        <div 
          className={`w-full max-w-sm bg-white h-full shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar Header */}
          <div className="h-16 border-b border-black/5 flex items-center justify-between px-6 shrink-0">
            <h2 className="text-base font-sora font-semibold text-[#111]">Filters</h2>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="p-2 text-[#737373] hover:text-black transition-colors rounded-full hover:bg-[#fafafa]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10">
            {/* Category Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111]">Category</h3>
              <div className="space-y-3">
                {FILTER_CATEGORIES.slice(1).map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-black/20 rounded-sm flex items-center justify-center group-hover:border-black transition-colors">
                      {activeCategory === cat && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <span className="text-sm text-[#737373] group-hover:text-black transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111]">Size</h3>
              <div className="flex flex-wrap gap-2">
                {FILTER_SIZES.map(size => (
                  <button key={size} className="w-10 h-10 border border-black/10 rounded-md text-xs font-semibold text-[#111] hover:border-black hover:bg-[#fafafa] transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111]">Color</h3>
              <div className="grid grid-cols-2 gap-3">
                {FILTER_COLORS.map(color => (
                  <label key={color.name} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color.hex }} />
                    <span className="text-sm text-[#737373] group-hover:text-black transition-colors">{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#111]">Price</h3>
              <div className="space-y-3">
                {["Under $50", "$50 to $100", "Over $100"].map(price => (
                  <label key={price} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-black/20 rounded-sm group-hover:border-black transition-colors" />
                    <span className="text-sm text-[#737373] group-hover:text-black transition-colors">{price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-black/5 bg-[#fafafa] shrink-0 flex gap-4">
            <button 
              className="flex-1 py-3 bg-white border border-black/10 text-[#111] text-sm font-semibold rounded-md hover:bg-black/5 transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 py-3 bg-[#111] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-black transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
