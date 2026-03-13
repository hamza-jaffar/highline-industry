import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCollections } from "@/lib/shopify/collection.query";

export default async function CollectionsPage() {
  const allCollections = await getCollections();
  const collections = allCollections.filter((c: any) => !c.metafield?.value);

  return (
    <div className="min-h-screen bg-surface">
      {/* Page Header */}
      <div className="pt-32 px-6 md:px-16 max-w-screen-xl mx-auto">
        <div className="border-b border-black/10 pb-8 mb-14">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted mb-2">
            Highline Industry
          </p>
          <h1 className="text-4xl md:text-5xl font-sora font-semibold text-[#0a0a0a] tracking-tight">
            Collections
          </h1>
        </div>
      </div>

      {/* Collection List — Tapstitch-style row layout */}
      <div className="px-6 md:px-16 pb-32 max-w-screen-xl mx-auto">
        {collections && collections.length > 0 ? (
          <div className="divide-y divide-black/8">
            {collections.map((collection: any, i: number) => (
              <Link
                key={collection.id}
                href={`/shop?collection=${collection.handle}`}
                className="group flex items-center gap-8 py-8 hover:bg-white hover:px-6 hover:rounded-2xl hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 -mx-0 hover:-mx-6"
              >
                {/* Collection Index */}
                <span className="hidden md:block text-[11px] font-bold tracking-[0.2em] text-[#c0c0c0] w-8 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-[#ebebeb]">
                  {collection.image?.url ? (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-black text-black/15">
                        {collection.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-sora font-semibold text-[#0a0a0a] mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    {collection.title}
                  </h2>
                  {collection.description && (
                    <p className="text-sm text-muted leading-relaxed line-clamp-1 max-w-lg">
                      {collection.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="shrink-0 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-[#111] group-hover:border-[#111] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-white transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="text-muted text-sm">
              No collections found. Make sure your Shopify credentials are configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
