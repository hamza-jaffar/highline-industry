"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

export default function ProductForm({ initialData, onSubmit, isLoading, submitLabel }: ProductFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: "",
    description: "",
    category: "Apparel",
    options: ["Size", "Color"],
    variants: [
      { price: "45.00", sku: "", quantity: "100", options: [{ name: "Size", value: "M" }, { name: "Color", value: "Black" }] }
    ]
  });

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { price: "0.00", sku: "", quantity: "0", options: formData.options.map((o: string) => ({ name: o, value: "" })) }]
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_: any, i: number) => i !== index)
    });
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...formData.variants];
    (newVariants[index] as any)[field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleOptionValueChange = (vIndex: number, oIndex: number, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].options[oIndex].value = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {/* Basic Info */}
      <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#111]">General Information</h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111]">Product Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Industrial Heavyweight Hoodie"
              className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111]">Description</label>
            <textarea 
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your product..."
              className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111]">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all appearance-none"
              >
                <option>Apparel</option>
                <option>Outerwear</option>
                <option>Tops</option>
                <option>Bottoms</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#111]">Variants</h3>
          <button 
            type="button"
            onClick={handleAddVariant}
            className="text-sm font-semibold text-black hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {formData.variants.map((v: any, vIndex: number) => (
            <div key={vIndex} className="p-6 bg-[#fafafa] border border-black/5 rounded-2xl space-y-6 relative group">
              {formData.variants.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveVariant(vIndex)}
                  className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {v.options.map((opt: any, oIndex: number) => (
                  <div key={oIndex} className="space-y-2">
                    <label className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">{opt.name}</label>
                    <input 
                      type="text"
                      value={opt.value}
                      onChange={(e) => handleOptionValueChange(vIndex, oIndex, e.target.value)}
                      placeholder={opt.name}
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs focus:outline-none focus:border-black/20 transition-all font-medium"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Price</label>
                  <input 
                    type="text"
                    value={v.price}
                    onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs focus:outline-none focus:border-black/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">SKU</label>
                  <input 
                    type="text"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs focus:outline-none focus:border-black/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Stock</label>
                  <input 
                    type="text"
                    value={v.quantity}
                    onChange={(e) => handleVariantChange(vIndex, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs focus:outline-none focus:border-black/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-black/5 z-30">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <Link 
            href="/dashboard/admin/products"
            className="px-6 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-semibold hover:bg-[#fafafa] transition-all"
          >
            Discard
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
