"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FolderOpen, Settings, ExternalLink, AlertCircle, Trash2, Plus, ChevronRight, Layers, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getAdminCollection, getAdminCollections, deleteCollection } from "@/app/actions/admin.action";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [subCollections, setSubCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollectionData();
  }, [id]);

  const fetchCollectionData = async () => {
    setIsLoading(true);
    const fullId = `gid://shopify/Collection/${id}`;

    // Fetch current collection
    const result = await getAdminCollection(fullId);

    if (result.success) {
      setCollection(result.data);

      // Fetch all collections to find children
      const allResult = await getAdminCollections(250);
      if (allResult.success) {
        const children = allResult.data.edges.filter(({ node }: any) => {
          return node.metafield?.value === fullId;
        });
        setSubCollections(children);
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCollection(`gid://shopify/Collection/${id}`);

    if (result.success) {
      router.push("/dashboard/admin/collections");
    } else {
      setError(result.error || "Failed to delete collection");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!isLoading && (error || !collection)) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-sora font-semibold text-[#111]">Collection Not Found</h2>
        <p className="text-[#737373]">{error || "The requested collection could not be located in the factory records."}</p>
        <Link
          href="/dashboard/admin/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>
      </div>
    );
  }

  const parentId = collection?.metafield?.value;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/collections" className="p-2 hover:bg-black/5 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {isLoading ? (
                <div className="h-9 w-48 bg-black/5 animate-pulse rounded-lg" />
              ) : (
                <>
                  <h1 className="text-3xl font-sora font-semibold text-[#111]">{collection?.title}</h1>
                  {parentId && (
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                      Sub-Collection
                    </span>
                  )}
                </>
              )}
            </div>
            {isLoading ? (
              <div className="h-4 w-32 bg-black/5 animate-pulse rounded mt-2" />
            ) : (
              <p className="text-[#737373] text-sm font-mono">{collection?.handle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isLoading}
            className="p-2.5 text-[#737373] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-20"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <a
            href={collection?.handle ? `/collections/${collection.handle}` : "#"}
            target="_blank"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-sm font-semibold hover:bg-[#fafafa] transition-all ${!collection?.handle ? 'pointer-events-none opacity-20' : ''}`}
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </a>
          <Link
            href={`/dashboard/admin/collections/${id}/edit`}
            className={`px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-sm ${isLoading ? 'pointer-events-none opacity-20' : ''}`}
          >
            Edit Collection
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection?.title}"? All product associations within this node will be severed. This action is irreversible.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Preview */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider mb-6 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Visual Identity
            </h3>
            <div className={`aspect-video rounded-xl border border-black/5 overflow-hidden bg-[#fafafa] ${isLoading ? 'animate-pulse bg-black/5' : ''}`}>
              {!isLoading && (
                collection.image ? (
                  <img src={collection.image.url} alt={collection.image.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-black/10">
                    <FolderOpen className="w-12 h-12 mb-2" />
                    <p className="text-xs font-medium">No industrial image assigned</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Hierarchy / Sub-collections */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 bg-[#fafafa]/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Collection Hierarchy
              </h3>
              {!isLoading && (
                <Link
                  href={`/dashboard/admin/collections/new?parentId=${collection.id}`}
                  className="text-xs font-bold text-black border-b border-black hover:border-transparent transition-all pb-0.5 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Sub-Collection
                </Link>
              )}
            </div>

            <div className="divide-y divide-black/5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/5" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-black/5 rounded" />
                        <div className="h-3 w-20 bg-black/5 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : subCollections.length > 0 ? (
                subCollections.map(({ node }: any) => (
                  <Link
                    key={node.id}
                    href={`/dashboard/admin/collections/${node.id.split('/').pop()}`}
                    className="flex items-center justify-between p-6 hover:bg-[#fafafa] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-black/40" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111]">{node.title}</p>
                        <p className="text-xs text-[#737373] font-mono">{node.handle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/20 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs text-[#737373]">No sub-collections nested under this node.</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Content Strategy
            </h3>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-full bg-black/5 rounded" />
                <div className="h-4 w-5/6 bg-black/5 rounded" />
                <div className="h-4 w-4/6 bg-black/5 rounded" />
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none text-[#111]"
                dangerouslySetInnerHTML={{ __html: collection.descriptionHtml || '<p class="italic text-[#737373]">No description provided...</p>' }}
              />
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h4 className="text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-4">Inventory Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#737373]">Total Products</span>
                  {isLoading ? (
                    <div className="h-4 w-8 bg-black/5 animate-pulse rounded" />
                  ) : (
                    <span className="font-semibold">{collection?.productsCount?.count || 0}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5">
              <h4 className="text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-4">Meta Data</h4>
              <div className="space-y-2">
                <div className={`px-3 py-2 bg-[#fafafa] border border-black/5 rounded-lg ${isLoading ? 'animate-pulse' : ''}`}>
                  <p className="text-[10px] font-bold text-[#737373]">Metafield: Parent ID</p>
                  {isLoading ? (
                    <div className="h-3 w-32 bg-black/5 rounded mt-1" />
                  ) : (
                    <p className="text-xs font-mono break-all">{parentId || 'ROOT_NODE'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-8 shadow-xl space-y-4">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Storage Node</h4>
            <p className="text-sm leading-relaxed">
              Collection hierarchy is mapped via factory-level metafields. This ensures compatibility with legacy Shopify structures while enabling deep nesting.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">Sync Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
