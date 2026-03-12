"use client";

import Link from "next/link";
import { ArrowRight, Box, Zap, Globe, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Precision Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden max-w-7xl mx-auto w-full">
        <div className="max-w-3xl space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black tracking-wide">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            Highline Platform v0.1
          </div>

          <h1 className="text-5xl md:text-7xl font-sora font-semibold tracking-tight text-[#111] leading-[1.1]">
            The Digital Infrastructure for Apparel
          </h1>

          <p className="text-lg text-[#737373] font-inter max-w-xl leading-relaxed">
            Manage your entire supply chain from one unified platform. Design, source, and scale production instantly with Highline's Factory-as-a-Service integration.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#111] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-black transition-colors flex items-center justify-center gap-2 group"
            >
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#111] text-sm font-semibold rounded-md border border-black/10 shadow-sm hover:bg-black/5 transition-colors text-center"
            >
              Explore Catalog
            </Link>
          </div>
        </div>

        {/* Hero Abstract Graphic (Subtle) */}
        <div className="absolute right-0 top-32 -z-10 hidden lg:block opacity-40">
          <div className="w-[600px] h-[600px] border border-black/5 rounded-full absolute -right-40 -top-40" />
          <div className="w-[400px] h-[400px] border border-black/10 rounded-full absolute -right-20 -top-20" />
          <div className="w-[200px] h-[200px] border border-black/20 rounded-full absolute right-0 top-0 bg-[#fafafa]" />
        </div>
      </section>

      {/* Structured SaaS Advantage Section */}
      <section className="px-6 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-sora font-semibold tracking-tight text-[#111] mb-4">Precision Manufacturing</h2>
            <p className="text-[#737373] max-w-2xl font-inter">
              Our standardized infrastructure removes the friction from apparel production, allowing you to focus on design and brand growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Box, title: "Standardized Blanks", desc: "Access our library of pre-engineered, high-quality garments." },
              { icon: Zap, title: "Rapid Prototyping", desc: "Go from digital concept to physical sample in under 72 hours." },
              { icon: Globe, title: "Global Logistics", desc: "Integrated fulfillment from our international hubs to your customers." },
              { icon: Shield, title: "Quality Assurance", desc: "Every unit passes through our rigorous 12-point inspection." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-black/10 bg-[#fafafa] hover:shadow-premium transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-white border border-black/10 flex items-center justify-center mb-6">
                  <item.icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-base font-sora font-semibold text-[#111] mb-2">{item.title}</h3>
                <p className="text-sm text-[#737373] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Catalog Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-sora font-semibold tracking-tight text-[#111] mb-3">Essential Systems</h2>
            <p className="text-[#737373] font-inter">Core garments engineered for maximum versatility.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-black hover:underline hidden sm:block">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { tag: "Core", title: "Heavyweight Jersey", img: "T" },
            { tag: "Performance", title: "Technical Outerwear", img: "O" },
            { tag: "Utility", title: "Industrial Denim", img: "D" }
          ].map((cat, i) => (
            <Link key={i} href="/shop" className="group block">
              <div className="w-full aspect-[4/5] bg-white border border-black/10 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden transition-all group-hover:shadow-elevated group-hover:border-black/20">
                <div className="text-[10rem] font-black text-black/5 group-hover:text-black/10 transition-colors pointer-events-none select-none">
                  {cat.img}
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-[#fafafa] border border-black/10 rounded text-[10px] font-semibold text-black tracking-wide uppercase">
                    {cat.tag}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-[#111]">{cat.title}</h3>
              <p className="text-sm text-[#737373]">Configure System</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Simple Conversion Block */}
      <section className="px-6 bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-sora font-semibold tracking-tight text-[#111]">
            Ready to scale your brand?
          </h2>
          <p className="text-lg text-[#737373] font-inter max-w-2xl mx-auto">
            Join the hundreds of modern apparel brands using Highline to power their supply chain.
          </p>
          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#111] text-white text-sm font-semibold rounded-md shadow-premium hover:bg-black transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
