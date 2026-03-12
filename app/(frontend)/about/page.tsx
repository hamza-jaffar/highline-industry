import Link from "next/link";
import { ArrowRight, ChevronRight, Activity, Globe, PackageOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-32 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Abstract Header */}
        <section className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold text-black tracking-wide mb-8">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            About Highline
          </div>
          <h1 className="text-5xl md:text-7xl font-sora font-semibold text-[#111] leading-[1.1] mb-8">
            Factory as a Service.
          </h1>
          <p className="text-xl md:text-2xl text-[#737373] font-inter leading-relaxed max-w-2xl">
            We are building the digital infrastructure for the next generation of apparel brands. Highline removes the friction of physical production so you can focus on what matters: design and community.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Activity,
              title: "Digital-First Production",
              desc: "Upload technical packs and see exact physical prototypes within 72 hours via our unified API array.",
            },
            {
              icon: Globe,
              title: "Global Distribution",
              desc: "Four international hubs allow you to hold inventory close to your customers, slashing shipping times and carbon footprint.",
            },
            {
              icon: PackageOpen,
              title: "Instant Scale",
              desc: "No minimum order quantities. Test a design with 5 units, scale a hit to 50,000 units the next week without changing suppliers.",
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-2xl bg-[#fafafa] border border-black/5 hover:shadow-elevated transition-shadow">
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-black/10 flex items-center justify-center mb-8">
                  <feature.icon className="w-6 h-6 text-black" />
               </div>
               <h3 className="text-lg font-sora font-semibold text-[#111] mb-4">{feature.title}</h3>
               <p className="text-[#737373] font-inter leading-relaxed text-sm">
                 {feature.desc}
               </p>
            </div>
          ))}
        </section>

        {/* Timeline/Process Narrative */}
        <section className="border-t border-black/5 pt-32">
           <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-sora font-semibold text-[#111]">The Highline Protocol</h2>
           </div>

           <div className="space-y-12 max-w-4xl">
             {[
               { id: "01", title: "Select a Blank System", text: "Browse our engineered catalog of core garments. Everything from heavyweight 400gsm fleece to breathable technical activewear." },
               { id: "02", title: "Configure & Sample", text: "Add your artwork, custom tags, and finishing requirements. Order a physical sample directly from the dashboard." },
               { id: "03", title: "Approve & Scale", text: "Once validated, flip the switch to batch production. 10 units or 10,000, the infrastructure handles the load instantly." }
             ].map((step) => (
               <div key={step.id} className="flex flex-col md:flex-row gap-8 items-start group">
                 <div className="text-2xl font-sora font-semibold text-black/20 group-hover:text-black transition-colors w-16">
                   {step.id}
                 </div>
                 <div className="flex-1 pb-12 border-b border-black/5 group-hover:border-black/20 transition-colors">
                    <h3 className="text-xl font-sora font-semibold text-[#111] mb-3">{step.title}</h3>
                    <p className="text-[#737373] text-base leading-relaxed max-w-xl">{step.text}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#fafafa] rounded-3xl p-12 md:p-24 border border-black/5 flex flex-col items-center text-center">
          <h2 className="text-4xl font-sora font-semibold text-[#111] mb-6">Build the physical world.</h2>
          <p className="text-[#737373] mb-10 max-w-lg">Join the platform powering the fastest growing modern apparel brands.</p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#111] text-white text-sm font-semibold rounded-md shadow-premium hover:bg-black transition-colors group"
          >
            Create Workspace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
}