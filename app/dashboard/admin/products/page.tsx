"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getAdminProducts, deleteProduct } from "@/app/actions/admin.action";
import { toast } from "sonner";
import { Plus, Search, PackageOpen, ChevronRight, ChevronLeft, Loader2, X, SlidersHorizontal, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/use-debounce";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function ProductsAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initial state from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [sortKey, setSortKey] = useState(searchParams.get("sort") || "CREATED_AT");
  const [reverse, setReverse] = useState(searchParams.get("reverse") === "false" ? false : true);
  const [per_page, setPerPage] = useState(Number(searchParams.get("per_page")) || 10);
  const [cursor, setCursor] = useState<string | undefined>(searchParams.get("cursor") || undefined);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  // Deletion State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("q", debouncedSearch); else params.delete("q");
    params.set("sort", sortKey);
    params.set("reverse", String(reverse));
    params.set("per_page", String(per_page));
    if (cursor) params.set("cursor", cursor); else params.delete("cursor");

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearch, sortKey, reverse, per_page, cursor, router, pathname, searchParams]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAdminProducts(per_page, cursor, debouncedSearch, sortKey, reverse);
    if (result.success) {
      setProducts(result.data.edges);
      setPageInfo(result.data.pageInfo);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [per_page, cursor, debouncedSearch, sortKey, reverse]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset pagination when filter criteria change ONLY (not cursor itself)
  const lastState = useRef({ debouncedSearch, sortKey, reverse, per_page });
  useEffect(() => {
    if (
      lastState.current.debouncedSearch !== debouncedSearch ||
      lastState.current.sortKey !== sortKey ||
      lastState.current.reverse !== reverse ||
      lastState.current.per_page !== per_page
    ) {
      setCursor(undefined);
      lastState.current = { debouncedSearch, sortKey, reverse, per_page };
    }
  }, [debouncedSearch, sortKey, reverse, per_page]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setReverse(!reverse);
    } else {
      setSortKey(key);
      setReverse(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setDeleteId(id);
    setDeleteTitle(title);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteProduct(deleteId);
    if (result.success) {
      toast.success("Product deleted successfully");
      setIsConfirmOpen(false);
      fetchProducts();
    } else {
      toast.error(result.error || "Failed to delete product");
    }
    setIsDeleting(false);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <SlidersHorizontal className="w-3 h-3 opacity-20" />;
    return reverse ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-sora font-semibold text-[#111]">Products</h1>
          <p className="text-[#737373] text-sm">Manage your catalog and inventory.</p>
        </div>

        <Link
          href="/dashboard/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters Hub */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-0 md:min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search products by title, handle, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:outline-none focus:border-black/30 focus:shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full"
            >
              <X className="w-3 h-3 text-[#737373]" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={per_page}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-black/10 rounded-xl text-xs font-semibold appearance-none focus:outline-none focus:border-black/30 hover:bg-[#fafafa] cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-full bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6 flex-1">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-sora font-semibold text-[#111]">API Connection Failed</h3>
            <p className="text-[#737373] text-sm max-w-xs mt-1 mb-8">
              {error}
            </p>
            <button
              onClick={() => fetchProducts()}
              className="text-sm font-semibold text-black hover:underline"
            >
              Try again
            </button>
          </div>
        ) : !isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6 flex-1">
            <div className="w-16 h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center mb-4 border border-black/5">
              <PackageOpen className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-sora font-semibold text-[#111]">No products found</h3>
            <p className="text-[#737373] text-sm max-w-xs mt-1 mb-8">
              {searchQuery ? `No results for "${searchQuery}". Try a different term or clear filters.` : "Start building your store by adding your first product."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-semibold text-black hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa]/50">
                    <th
                      onClick={() => handleSort('TITLE')}
                      className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider cursor-pointer hover:text-black transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Product
                        <SortIcon columnKey="TITLE" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-center">Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-center">Status</th>
                    <th
                      onClick={() => handleSort('UPDATED_AT')}
                      className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-center cursor-pointer hover:text-black transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        Updated
                        <SortIcon columnKey="UPDATED_AT" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {isLoading ? (
                    Array.from({ length: per_page }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-black/5 flex-shrink-0" />
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-black/5 rounded" />
                              <div className="h-3 w-24 bg-black/5 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-12 bg-black/5 rounded mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 w-16 bg-black/5 rounded-full mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-black/5 rounded mx-auto" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-8 bg-black/5 rounded-lg ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    products.map(({ node }) => (
                      <tr key={node.id} className="group hover:bg-[#fafafa] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/products/${node.id.split('/').pop()}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg border border-black/5 bg-[#fafafa] overflow-hidden flex-shrink-0">
                              {node.featuredImage ? (
                                <img src={node.featuredImage.url} alt={node.featuredImage.altText} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PackageOpen className="w-5 h-5 text-black/10" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111] leading-none mb-1 group-hover:text-black">{node.title}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-[#737373] font-mono">{node.handle}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm text-[#111] font-medium">
                            {node.priceRangeV2.minVariantPrice.amount} {node.priceRangeV2.minVariantPrice.currencyCode}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${node.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                            {node.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-[11px] text-[#737373] font-mono">
                            {node.updatedAt ? new Date(node.updatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/admin/products/${node.id.split('/').pop()}/edit`}
                              className="p-2 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(e, node.id, node.title)}
                              className="p-2 hover:bg-red-700 cursor-pointer bg-red-500 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-black/5 flex items-center justify-between bg-[#fafafa]/30 mt-auto">
              <p className="text-[11px] text-[#737373] font-medium tracking-tight">
                PAGE {pageInfo?.hasNextPage ? 'ACTIVE' : 'FINAL'} — {products.length} ENTRIES LOADED
              </p>
              <div className="flex gap-2">
                <button
                  disabled={!pageInfo?.hasPreviousPage}
                  onClick={() => setCursor(undefined)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#fafafa] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Prev
                </button>
                <button
                  disabled={!pageInfo?.hasNextPage}
                  onClick={() => setCursor(pageInfo.endCursor)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white border border-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTitle}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
