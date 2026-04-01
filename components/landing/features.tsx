import Image from "next/image";
import { CheckCircle2, Award, Sparkles, Zap, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Pro-Level Performance",
    desc: "Engineered with advanced materials to keep you cool, dry, and focused during your toughest workouts."
  },
  {
    icon: Sparkles,
    title: "Durable Materials",
    desc: "Built to withstand the most intense training sessions. Our gear lasts longer and performs better."
  },
  {
    icon: Zap,
    title: "Fast Shipping",
    desc: "Quick processing and expedited delivery options so you never have to wait for your next game."
  },
  {
    icon: Globe,
    title: "Worldwide Delivery",
    desc: "We ship our premium sports gear to athletes everywhere, ensuring you stay equipped wherever you are."
  }
];

export default function Features() {
  return (
    <section className="py-12 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-4xl md:text-6xl font-sora font-semibold tracking-tight text-[#111]">
            Unleash your true potential <br /><span className="text-black/30">with elite equipment</span>
          </h2>
          <p className="text-lg text-black/60 font-inter leading-relaxed">
            Highline provides gear that works as hard as you do. We've optimized every detail so you can focus entirely on achieving peak athletic performance.
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
                    Every piece of gear undergoes rigorous testing before it makes it to you. Designed for champions, tested for the long run.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                     <CheckCircle2 className="w-5 h-5 text-white" />
                     <span className="text-xs font-bold text-white uppercase tracking-widest">Certified Pro Gear</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
