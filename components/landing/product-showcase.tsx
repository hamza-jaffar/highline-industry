"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  price: string;
  image: string;
  tag?: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Heavyweight Oversized Tee",
    handle: "heavyweight-oversized-tee",
    price: "18.50",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    tag: "BESTSELLER"
  },
  {
    id: "2",
    title: "Premium Fleece Hoodie",
    handle: "premium-fleece-hoodie",
    price: "32.00",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    tag: "NEW"
  },
  {
    id: "3",
    title: "Essential Boxy Sweatshirt",
    handle: "essential-boxy-sweatshirt",
    price: "28.00",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800",
    tag: "RESTOCK"
  },
  {
    id: "4",
    title: "Vintage Wash Crewneck",
    handle: "vintage-wash-crewneck",
    price: "24.50",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
  }
];

export default function ProductShowcase({ products = FALLBACK_PRODUCTS }: { products?: Product[] }) {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#fcfcfc]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-sora font-semibold tracking-tight text-[#111]">
              Beautiful bestselling blanks, <br /><span className="text-black/30">ready for your vision</span>
            </h2>
            <p className="text-black/50 font-inter max-w-xl">
              Curated essentials engineered for high-performance printing and maximum comfort. Tested to retail standards.
            </p>
          </div>
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 text-sm font-bold border-b-2 border-black pb-1 hover:text-black/60 hover:border-black/60 transition-all"
          >
            VIEW FULL CATALOG
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.handle}`} className="group relative">
              <div className="aspect-3/4 rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm group-hover:shadow-premium transition-all relative">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {product.tag && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-black/5 rounded text-[10px] font-bold text-black tracking-widest uppercase shadow-sm">
                      {product.tag}
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                   <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 fill-current" />
                   </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-1">
                <h3 className="text-base font-bold text-[#111] group-hover:text-black/60 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-black/50">From ${product.price}</p>
                  <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">#H-00{product.id}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
