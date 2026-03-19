import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center pt-24 pb-16 px-6 md:px-12 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-bold text-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Premium Quality POD
          </div>

          <h1 className="text-5xl md:text-7xl font-sora font-semibold tracking-tight text-[#111] leading-[1.05]">
            Create and sell <span className="text-black/40 italic">premium</span> custom clothes easily
          </h1>

          <p className="text-lg md:text-xl text-black/60 font-inter max-w-xl leading-relaxed">
            Highline is your dedicated apparel partner. We bring your vision to life with factory-direct quality, rapid fulfillment, and seamless e-commerce integrations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-10 py-4 bg-black text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-10 py-4 bg-white text-black text-sm font-bold rounded-full border border-black/10 shadow-sm hover:bg-black/5 transition-all text-center"
            >
              Shop Blanks
            </Link>
          </div>
          
          <div className="flex items-center gap-8 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-black/5 overflow-hidden">
                  <div className="w-full h-full bg-slate-200" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-black/60">
              Trusted by <span className="text-black font-bold">500+</span> luxury brands
            </p>
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[700px] w-full group">
          <div className="absolute inset-0 bg-linear-to-tr from-slate-100 to-transparent rounded-[40px] -z-10 group-hover:scale-105 transition-transform duration-700" />
          <div className="relative h-full w-full flex items-center justify-center p-8">
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl">
              <Image
                src="/premium_apparel_hero.png"
                alt="Premium Apparel Hero"
                fill
                priority
                className="object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 md:bottom-12 md:-left-12 bg-white p-6 rounded-2xl shadow-premium border border-black/5 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Shipment Status</p>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-black">Order Delivered in 72h</p>
               </div>
            </div>
            
             <div className="absolute top-12 -right-6 md:top-24 md:-right-12 bg-black text-white p-5 rounded-2xl shadow-2xl space-y-1 animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
               <div className="flex items-center gap-2">
                 {[1, 2, 3, 4, 5].map(i => (
                   <svg key={i} className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M10 1l2.6 6.3 6.9 1-5 4.9 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-5-4.9 6.9-1L10 1z"/></svg>
                 ))}
               </div>
               <p className="text-xs font-bold">"Exceptional quality blanks"</p>
               <p className="text-[10px] text-white/60">— Vogue Daily</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#fcfcfc] -z-20 -skew-x-12 translate-x-1/2" />
    </section>
  );
}
