"use client";

import { useState } from "react";
import { Search, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { bulkAssignProductsToAffiliateAction, unassignProductFromAffiliateAction } from "@/app/actions/affiliate.action";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string } | null;
}

interface Assignment {
  id: string;
  productHandle: string;
  overrideCommissionRate: string;
}

export default function ProductAssignmentManager({
  affiliateId,
  products,
  initialAssignments,
}: {
  affiliateId: string;
  products: Product[];
  initialAssignments: Assignment[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState("15.00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (handle: string) => {
    setSelectedHandles(prev =>
      prev.includes(handle) ? prev.filter(h => h !== handle) : [...prev, handle]
    );
  };

  const selectAll = () => {
    if (selectedHandles.length === filteredProducts.length) {
      setSelectedHandles([]);
    } else {
      setSelectedHandles(filteredProducts.map(p => p.handle));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedHandles.length === 0) {
      toast.error("Select at least one product");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await bulkAssignProductsToAffiliateAction(affiliateId, selectedHandles, commissionRate);
      if (res.success) {
        toast.success(`Assigned ${selectedHandles.length} products`);
        setSelectedHandles([]);
      } else {
        toast.error(res.error || "Failed to assign products");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await unassignProductFromAffiliateAction(id);
      if (res.success) {
        toast.success("Assignment removed");
      } else {
        toast.error(res.error || "Failed to remove");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Product Selection */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <button
              onClick={selectAll}
              className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
            >
              {selectedHandles.length === filteredProducts.length ? "Deselect All" : "Select All Visible"}
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredProducts.map(product => {
              const isSelected = selectedHandles.includes(product.handle);
              const isAssigned = initialAssignments.some(a => a.productHandle === product.handle);

              return (
                <div
                  key={product.id}
                  onClick={() => toggleSelection(product.handle)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-black bg-black/2' : 'border-black/5 hover:border-black/20'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black/5 rounded-lg overflow-hidden shrink-0">
                      {product.featuredImage ? (
                        <img src={product.featuredImage.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black/5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">{product.title}</h4>
                      <p className="text-xs text-black/40">{product.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isAssigned && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded shadow-sm">Assigned</span>
                    )}
                    {isSelected ? <CheckCircle2 className="w-5 h-5 text-black" /> : <Circle className="w-5 h-5 text-black/10" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Actions and Overrides */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-black text-white rounded-xl p-4 shadow-xl space-y-6 sticky top-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold uppercase tracking-tight">Bulk Assignment</h3>
            <p className="text-white/60 text-xs">Apply a specific commission rate to selected products.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Commission Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">%</span>
              </div>
            </div>

            <button
              disabled={isSubmitting || selectedHandles.length === 0}
              onClick={handleBulkAssign}
              className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? "Processing..." : `Assign ${selectedHandles.length} Products`}
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Overrides ({initialAssignments.length})</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {initialAssignments.length === 0 && <p className="text-xs text-white/30 italic">No overrides currently active.</p>}
              {initialAssignments.map(as => {
                const product = products.find(p => p.handle === as.productHandle);
                return (
                  <div key={as.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-white/5 shrink-0 overflow-hidden">
                        {product?.featuredImage && <img src={product.featuredImage.url} alt="" className="w-full h-full object-cover opacity-80" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-white truncate">{product?.title || as.productHandle}</p>
                        <p className="text-[10px] text-green-400 font-bold">{as.overrideCommissionRate}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(as.id)}
                      className="p-1.5 hover:bg-red-500/20 hover:text-red-500 text-white/20 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
