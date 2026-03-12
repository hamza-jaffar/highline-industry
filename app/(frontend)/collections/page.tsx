import Link from "next/link";
import { ArrowRight } from "lucide-react";

const COLLECTIONS = [
  { id: "fw25", name: "FW25 Heavyweight Drop", desc: "Engineered for harsh climates. 400gsm fleece and technical outerwear.", img: "H" },
  { id: "essentials", name: "Core Essentials", desc: "The foundation of any brand. Perfect fit blanks in high-quality jersey.", img: "C" },
  { id: "utility", name: "Industrial Utility", desc: "Workwear-inspired bottoms and jackets with reinforced stitching.", img: "U" },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-sora font-semibold text-[#111] tracking-tight mb-4">Curated Systems</h1>
          <p className="text-lg text-[#737373] font-inter leading-relaxed">
            Explore our pre-configured garment systems, designed to launch capsule collections with zero friction.
          </p>
        </div>

        {/* Collections Stack */}
        <div className="space-y-12">
          {COLLECTIONS.map((collection, i) => (
            <Link 
              key={collection.id} 
              href={`/shop?collection=${collection.id}`}
              className="group flex flex-col md:flex-row bg-[#fafafa] border border-black/10 rounded-2xl overflow-hidden hover:shadow-elevated transition-all"
            >
              {/* Image abstract */}
              <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-white border-b md:border-b-0 md:border-r border-black/5 relative flex items-center justify-center overflow-hidden">
                 <div className="text-[15rem] font-black text-black/5 group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none">
                  {collection.img}
                 </div>
                 <div className="absolute top-6 left-6">
                    <span className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded shadow-sm">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                 </div>
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                <h2 className="text-3xl font-sora font-semibold text-[#111] mb-4">{collection.name}</h2>
                <p className="text-base text-[#737373] font-inter leading-relaxed mb-8 max-w-md">
                  {collection.desc}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-black group-hover:text-black/70 transition-colors">
                  Explore System
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
