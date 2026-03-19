import Image from "next/image";
import { CheckCircle2, Award, Sparkles, Zap, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Premium Blanks",
    desc: "We exclusively source and manufacture high-GSM, luxury-grade blanks that feel expensive and last longer."
  },
  {
    icon: Sparkles,
    title: "Eco-Friendly Tech",
    desc: "Our printing and dyeing processes use 70% less water and OEKO-TEX certified sustainable inks."
  },
  {
    icon: Zap,
    title: "Rapid Fulfillment",
    desc: "From order placement to worldwide shipping in under 72 hours. Speed that keeps your customers coming back."
  },
  {
    icon: Globe,
    title: "Global Supply Chain",
    desc: "Manage production across multiple international hubs from a single, unified digital dashboard."
  }
];

export default function Features() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-4xl md:text-6xl font-sora font-semibold tracking-tight text-[#111]">
            We bring your designs to life <br /><span className="text-black/30">with care and innovation</span>
          </h2>
          <p className="text-lg text-black/60 font-inter leading-relaxed">
            Highline isn't just a platform; it's your personal factory infrastructure. We've removed the complexity from apparel manufacturing so you can focus on building your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
            {FEATURES.map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111]">{feature.title}</h3>
                <p className="text-black/60 font-inter leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="relative aspect-square lg:aspect-[4/5] rounded-[40px] overflow-hidden shadow-premium group">
            <Image
              src="/apparel_craftsmanship.png"
              alt="Craftsmanship"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
               <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 space-y-4">
                  <h4 className="text-2xl font-bold text-white">Quality worth wearing</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Every garment undergoes a 12-point inspection before it leaves our facility. No loose threads, no alignment issues, just perfection.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                     <CheckCircle2 className="w-5 h-5 text-green-400" />
                     <span className="text-xs font-bold text-white uppercase tracking-widest">Certified Premium Facility</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
