import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-12 pb-16 px-6 md:px-12 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Bold Typography */}
        <div className="space-y-10 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-bold text-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Designed For Champions
          </div>

          <h1 className="text-5xl md:text-7xl font-sora font-black tracking-tighter text-[#111] leading-[1.05] uppercase">
            Elevate Your <br />
            <span className="opacity-40 italic">Game.</span>
          </h1>

          <p className="text-lg md:text-xl text-black/60 font-inter max-w-xl font-medium leading-relaxed">
            Discover professional-grade sports equipment and high-performance apparel engineered for athletes who demand the absolute best.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-10 py-4 mb-2 sm:mb-0 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-full shadow-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections"
              className="w-full sm:w-auto px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 transition-all text-center"
            >
              View Apparel
            </Link>
          </div>
          
          <div className="flex items-center gap-8 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-black/5 overflow-hidden flex items-center justify-center font-bold text-black/50 text-xs shadow-sm bg-white">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-black/50 uppercase tracking-widest">
              Chosen by <span className="text-black font-black">10,000+</span> Athletes
            </p>
          </div>
        </div>

        {/* Right Side: Sleek Sports Image */}
        <div className="relative aspect-[4/5] lg:h-[700px] w-full group overflow-hidden">
          <div className="absolute inset-0 bg-[#f4f4f5] rounded-[40px] -z-10 transition-transform duration-700 group-hover:bg-[#111]" />
          <div className="relative h-full w-full p-4 md:p-8 flex items-center justify-center">
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl bg-black">
              <Image
                src="/premium_apparel_hero.png"
                alt="High Performance Sports Gear"
                fill
                priority
                className="object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-60" />
            </div>
            
            {/* Dynamic UI B&W Callout Card */}
            <div className="absolute bottom-12 -left-4 md:-left-8 bg-white p-5 md:p-7 rounded-2xl shadow-2xl border border-black/5 space-y-2 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
               <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Performance Rating</p>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} className="w-4 h-4 text-black fill-current" viewBox="0 0 20 20"><path d="M10 1l2.6 6.3 6.9 1-5 4.9 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-5-4.9 6.9-1L10 1z"/></svg>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-black border-l-2 border-black/10 pl-3">5.0 / 5.0</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Structural Backdrop Element */}
      <div className="absolute top-0 right-0 w-[45%] h-full bg-[#fcfcfc] -z-20 -skew-x-[16deg] translate-x-1/3 opacity-50" />
    </section>
  );
}
