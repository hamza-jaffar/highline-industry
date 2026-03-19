import { Check, X } from "lucide-react";

const COMPARISON_DATA = [
  {
    feature: "Premium Blank Quality",
    highline: true,
    generic: false,
    detail: "Heavyweight 300+ GSM cotton vs. standard 150 GSM"
  },
  {
    feature: "Oversized & Custom Fits",
    highline: true,
    generic: false,
    detail: "Fashion-forward silhouettes vs. 'tube' t-shirts"
  },
  {
    feature: "Rapid 72h Fulfillment",
    highline: true,
    generic: "7-14 Days",
    detail: "Global shipping from local hubs"
  },
  {
    feature: "No Minimum Order",
    highline: true,
    generic: true,
    detail: "Scalable from 1 to 10,000 units"
  },
  {
    feature: "Sustainable Inks",
    highline: true,
    generic: false,
    detail: "OEKO-TEX certified water-based inks"
  },
  {
    feature: "Retail-Ready Packaging",
    highline: true,
    generic: false,
    detail: "Custom neck labels and compostable polybags"
  }
];

export default function Comparison() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-sora font-semibold tracking-tight text-[#111]">
            Highline vs. <span className="text-black/30">Traditional POD</span>
          </h2>
          <p className="text-black/50 font-inter max-w-2xl mx-auto leading-relaxed text-lg">
            We've redesigned the print-on-demand experience for modern fashion brands who demand retail-quality results.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5">
                <th className="py-8 px-6 text-sm font-black uppercase tracking-widest text-black/40 w-1/3">Feature</th>
                <th className="py-8 px-6 text-xl font-bold text-black bg-black/5 rounded-t-3xl text-center">Highline</th>
                <th className="py-8 px-6 text-sm font-bold text-black/40 text-center">Generic POD</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((item, i) => (
                <tr key={i} className="border-b border-black/5 group hover:bg-black/1 transition-colors">
                  <td className="py-6 px-6">
                    <p className="font-bold text-[#111]">{item.feature}</p>
                    <p className="text-xs text-black/40 font-medium mt-1">{item.detail}</p>
                  </td>
                  <td className="py-6 px-6 bg-black/2 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <div className="flex justify-center">
                      {typeof item.generic === 'boolean' ? (
                        item.generic ? (
                           <Check className="w-5 h-5 text-black/20" />
                        ) : (
                          <X className="w-5 h-5 text-black/10" />
                        )
                      ) : (
                        <span className="text-sm font-bold text-black/30 italic">{item.generic}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
