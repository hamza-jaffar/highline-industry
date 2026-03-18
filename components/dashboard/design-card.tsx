import { Edit2, Package, Clock, ExternalLink, MoreVertical } from "lucide-react";
import Link from "next/link";

interface DesignCardProps {
  design: {
    id: string;
    name: string | null;
    productHandle: string;
    color: string;
    previewUrl: string | null;
    updatedAt: Date | null;
  };
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <div className="group bg-white border border-black/5 rounded-2xl overflow-hidden hover:border-black/10 transition-all shadow-sm hover:shadow-premium duration-300">
      <div className="aspect-[4/3] bg-[#fdfdfd] relative flex items-center justify-center p-8 overflow-hidden">
        {design.previewUrl ? (
          <img
            src={design.previewUrl}
            alt={design.name || 'Design'}
            className="max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
            <Package className="w-8 h-8 text-black/20" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <Link
            href={`/customizer/${design.productHandle}?designId=${design.id}`}
            className="px-4 py-2 bg-black text-white text-[10px] font-semibold rounded-md flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Edit2 className="w-3 h-3" />
            Edit Project
          </Link>
        </div>
      </div>

      <div className="p-5 border-t border-black/[0.03]">
        <div className="flex justify-between items-start mb-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#111] truncate mb-1">
              {design.name || `${design.productHandle}`}
            </h3>
            <div className="flex items-center gap-2">
              <span className={design.color === 'Black' ? 'w-2 h-2 rounded-full border border-black/10 bg-black' : 'w-2 h-2 rounded-full border border-black/10 bg-white'}></span>
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                {design.color}
              </span>
            </div>
          </div>
          <button className="p-1 rounded-md hover:bg-black/5 text-black/20 hover:text-black/40 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-black/30 font-semibold pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {design.updatedAt ? new Date(design.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
          </div>
          <Link
            href={`/customizer/${design.productHandle}?designId=${design.id}`}
            className="text-black/40 hover:text-black flex items-center gap-1 transition-colors"
          >
            Details <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
