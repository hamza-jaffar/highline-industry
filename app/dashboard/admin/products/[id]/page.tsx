"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Tag, Layers, Settings, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAdminProduct } from "@/app/actions/admin.action";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    // Shopify GID format: gid://shopify/Product/[id]
    const fullId = `gid://shopify/Product/${id}`;
    const result = await getAdminProduct(fullId);
    
    if (result.success) {
      setProduct(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-sm text-[#737373] mt-4">Retrieving product core data...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-sora font-semibold text-[#111]">Product Not Found</h2>
        <p className="text-[#737373]">{error || "The requested product infrastructure could not be located."}</p>
        <Link 
          href="/dashboard/admin/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/products" className="p-2 hover:bg-black/5 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-sora font-semibold text-[#111]">{product.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {product.status}
              </span>
            </div>
            <p className="text-[#737373] text-sm font-mono">{product.id.split('/').pop()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={`/product/${product.handle}`} 
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl text-sm font-semibold hover:bg-[#fafafa] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </a>
          <Link 
            href={`/dashboard/admin/products/${product.id.split('/').pop()}/edit`}
            className="px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-sm flex items-center gap-2"
          >
            Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm overflow-hidden">
             <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider mb-6 flex items-center gap-2">
               <Package className="w-4 h-4" /> Gallery Details
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {product.images.edges.map(({ node }: any, i: number) => (
                 <div key={i} className="aspect-square rounded-xl border border-black/5 overflow-hidden bg-[#fafafa]">
                   <img src={node.url} alt={node.altText} className="w-full h-full object-cover" />
                 </div>
               ))}
               {product.images.edges.length === 0 && (
                 <div className="col-span-full py-12 text-center border-2 border-dashed border-black/5 rounded-xl">
                    <p className="text-xs text-[#737373]">No industrial assets uploaded.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Description
            </h3>
            <div 
              className="prose prose-sm max-w-none text-[#111]"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* Variants Table */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 bg-[#fafafa]/50">
              <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Variant Matrix
              </h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#737373] uppercase tracking-wider text-right">Inventory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {product.variants.edges.map(({ node }: any) => (
                  <tr key={node.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#111]">{node.title}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#737373]">{node.sku || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111]">{node.price}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs font-bold ${node.inventoryQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {node.inventoryQuantity} Units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-2">Organization</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#737373]">Vendor</span>
                    <span className="font-semibold">{product.vendor}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#737373]">Type</span>
                    <span className="font-semibold">{product.productType || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/5">
                <h4 className="text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-2">Options</h4>
                <div className="flex flex-wrap gap-2">
                  {product.options.map((opt: any, i: number) => (
                    <div key={i} className="px-3 py-1 bg-[#fafafa] border border-black/5 rounded-lg">
                      <p className="text-[10px] font-bold text-[#737373]">{opt.name}</p>
                      <p className="text-xs font-semibold">{opt.values.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           <div className="bg-black text-white rounded-2xl p-8 shadow-xl space-y-4">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Factory Insights</h4>
              <p className="text-sm leading-relaxed">
                This project is currently processing across multiple nodes. Variations are synced with global inventory.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">Operational</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
