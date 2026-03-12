"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, ChevronRight, ChevronLeft, Loader2, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { getAdminCollections } from "@/app/actions/admin.action";

export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchCollections();
  }, [cursor]);

  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAdminCollections(10, cursor);
    if (result.success) {
      setCollections(result.data.edges);
      setPageInfo(result.data.pageInfo);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-sora font-semibold text-[#111]">Collections</h1>
          <p className="text-[#737373] text-sm">Organize your products into groups.</p>
        </div>
        
        <Link 
          href="/dashboard/admin/collections/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </Link>
      </div>

      <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-black/20" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6 flex-1">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-sora font-semibold text-[#111]">API Connection Failed</h3>
            <p className="text-[#737373] text-sm max-w-xs mt-1 mb-8">
              {error}
            </p>
            <button 
              onClick={fetchCollections}
              className="text-sm font-semibold text-black hover:underline"
            >
              Try again
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6 flex-1">
            <div className="w-16 h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center mb-4 border border-black/5">
              <FolderOpen className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-sora font-semibold text-[#111]">No collections yet</h3>
            <p className="text-[#737373] text-sm max-w-xs mt-1 mb-8">
              Group your products into collections like "Featured" or "New Arrivals".
            </p>
            <Link 
              href="/dashboard/admin/collections/new"
              className="text-sm font-semibold text-black hover:underline"
            >
              Create your first collection
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa]/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider">Collection</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider">Products</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {collections.map(({ node }) => (
                    <tr key={node.id} className="group hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg border border-black/5 bg-[#fafafa] overflow-hidden flex-shrink-0">
                            {node.image ? (
                              <img src={node.image.url} alt={node.image.altText} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FolderOpen className="w-5 h-5 text-black/10" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111] leading-none mb-1">{node.title}</p>
                            <p className="text-[10px] text-[#737373] font-mono">{node.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#111] font-medium">{node.productsCount.count} products</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                          <ChevronRight className="w-4 h-4 text-black/40" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-black/5 flex items-center justify-between bg-[#fafafa]/30 mt-auto">
              <p className="text-[11px] text-[#737373] font-medium">
                Showing {collections.length} collections
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={!pageInfo?.hasPreviousPage}
                  onClick={() => setCursor(undefined)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-semibold hover:bg-[#fafafa] transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Previous
                </button>
                <button 
                  disabled={!pageInfo?.hasNextPage}
                  onClick={() => setCursor(pageInfo.endCursor)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-semibold hover:bg-[#fafafa] transition-all disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
