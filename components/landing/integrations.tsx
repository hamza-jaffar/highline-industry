import { ShoppingCart, Store, Rocket, Share2 } from "lucide-react";

const PLATFORMS = [
  { name: "Shopify", icon: ShoppingCart },
  { name: "WooCommerce", icon: Store },
  { name: "Wix", icon: Rocket },
  { name: "TikTok Shop", icon: Share2 }
];

export default function Integrations() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-bold text-black uppercase tracking-widest">
            Connect & Scale
          </div>
          <h2 className="text-4xl md:text-5xl font-sora font-semibold tracking-tight text-[#111]">
            Seamlessly integrated with <span className="text-black/30">your favorite platforms</span>
          </h2>
          <p className="text-lg text-black/60 font-inter leading-relaxed max-w-xl">
             Automate your design-to-delivery workflow. Connect your store in seconds and start selling premium apparel without touching a single garment.
          </p>
          <div className="flex flex-wrap gap-8 pt-4 grayscale opacity-40">
             {PLATFORMS.map((platform, i) => (
               <div key={i} className="flex items-center gap-2 py-2 px-4 rounded-xl border border-black/10 bg-white shadow-sm font-bold text-black/40">
                  <platform.icon className="w-5 h-5" />
                  <span>{platform.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="relative">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                 <div className="p-8 bg-black text-white rounded-[32px] space-y-4 shadow-2xl">
                    <h3 className="text-4xl font-black">72h</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40">Average Delivery</p>
                 </div>
                 <div className="p-8 bg-white border border-black/5 rounded-[32px] space-y-4 shadow-premium">
                    <h3 className="text-4xl font-black text-[#111]">99.8%</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-black/40">Uptime Reliability</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="p-8 bg-white border border-black/5 rounded-[32px] space-y-4 shadow-premium">
                    <h3 className="text-4xl font-black text-[#111]">500+</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-black/40">Active Brands</p>
                 </div>
                 <div className="p-8 bg-white border border-black/5 rounded-[32px] space-y-4 shadow-premium">
                    <h3 className="text-4xl font-black text-[#111]">1M+</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-black/40">Units Shipped</p>
                 </div>
              </div>
           </div>
           
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/5 rounded-full -z-10 blur-3xl" />
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full -z-10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
