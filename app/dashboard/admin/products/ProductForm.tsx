"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, Loader2, Image as ImageIcon, Upload, Trash2, Layers, Tag, Settings, Package, ChevronDown, Monitor, Globe } from "lucide-react";
import Link from "next/link";
import { getAdminCollections } from "@/app/actions/admin.action";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

export default function ProductForm({ initialData, onSubmit, isLoading, submitLabel }: ProductFormProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [isFetchingCollections, setIsFetchingCollections] = useState(false);

  const getInitialFormData = (data: any) => ({
    title: data?.title || "",
    description: data?.descriptionHtml || "",
    status: data?.status || "ACTIVE",
    category: data?.productType || "",
    vendor: data?.vendor || "Highline Industry",
    collections: data?.collections?.edges?.map(({ node }: any) => node.id) || [],
    options: data?.options?.map((o: any) => o.name) || ["Size", "Color"],
    variants: data?.variants?.edges?.map(({ node }: any) => ({
      id: node.id,
      price: node.price,
      sku: node.sku || "",
      quantity: node.inventoryQuantity?.toString() || "0",
      options: node.selectedOptions.map((so: any) => ({ name: so.name, value: so.value })),
      image: node.image ? { id: node.image.id, url: node.image.url, altText: node.image.altText } : null
    })) || [
      { price: "0.00", sku: "", quantity: "0", options: [{ name: "Size", value: "M" }, { name: "Color", value: "Black" }], image: null }
    ],
    images: data?.images?.edges?.map(({ node }: any) => ({ url: node.url, altText: node.altText })) || []
  });

  const [formData, setFormData] = useState(getInitialFormData(initialData));

  useEffect(() => {
    setFormData(getInitialFormData(initialData));
  }, [initialData]);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsFetchingCollections(true);
      const result = await getAdminCollections(250); // Get more to be sure
      if (result.success) {
        setCollections(result.data.edges.map((e: any) => e.node));
      }
      setIsFetchingCollections(false);
    };
    fetchCollections();
  }, []);

  const [previews, setPreviews] = useState<any[]>(formData.images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = await Promise.all(files.map(async (file) => {
      const base64 = await toBase64(file);
      return {
        file,
        base64,
        type: file.type,
        name: file.name,
        preview: URL.createObjectURL(file)
      };
    }));

    setPreviews([...previews, ...newImages]);
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages]
    });
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
    reader.onerror = error => reject(error);
  });

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { price: "0.00", sku: "", quantity: "0", options: formData.options.map((o: string) => ({ name: o, value: "" })), image: null }]
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

  const handleVariantImageChange = async (vIndex: number, file: File | null) => {
    if (!file) return;

    const base64 = await toBase64(file);
    const preview = URL.createObjectURL(file);

    const newVariants = [...formData.variants];
    newVariants[vIndex].image = {
      file,
      base64,
      type: file.type,
      name: file.name,
      preview,
      altText: formData.title || "",
    };

    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantImageRemove = (vIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].image = null;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Title and Description */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted" /> Title
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Short Sleeve T-Shirt"
                  className="w-full px-4 py-3 bg-surface border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#111] uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted" /> Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) => setFormData({...formData, description: html})}
                  placeholder="Tell your customers about this product..."
                  minHeight={220}
                />
              </div>
            </div>
          </div>

          {/* Media Manager */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Media Manager
              </h3>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-black border-b border-black hover:border-transparent transition-all pb-0.5"
              >
                Upload New Asset
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl border border-black/5 overflow-hidden bg-surface group">
                  <img 
                    src={img.preview || img.url} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white rounded-full shadow-lg border border-black/10 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[8px] font-bold uppercase rounded tracking-widest">
                      Featured
                    </div>
                  )}
                </div>
              ))}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-black/5 bg-surface hover:border-black/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-muted"
              >
                <div className="p-2 bg-white rounded-full shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-black/40" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
              </div>
            </div>
          </div>

          {/* Variants Table */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-surface/50">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Variant Matrix
              </h3>
              <button 
                type="button"
                onClick={handleAddVariant}
                className="text-xs font-bold text-black border-b border-black hover:border-transparent transition-all pb-0.5 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Variation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-150">
                <thead>
                  <tr className="border-b border-black/5 bg-surface/30">
                    <th className="px-8 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Appearance</th>
                    <th className="px-12 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider text-center">Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider text-center">Inventory</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider text-center">SKU</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {formData.variants.map((v: any, vIndex: number) => (
                    <tr key={vIndex} className="group hover:bg-surface/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          {v.options.map((opt: any, oIndex: number) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-muted w-12">{opt.name}:</span>
                              <input 
                                type="text"
                                value={opt.value}
                                onChange={(e) => handleOptionValueChange(vIndex, oIndex, e.target.value)}
                                className="bg-white border border-black/5 rounded-md px-2 py-1 text-xs w-24 focus:outline-none focus:border-black/20"
                                placeholder="..."
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-12 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {v.image ? (
                            <div className="relative">
                              <img
                                src={v.image.preview || v.image.url}
                                alt={v.image.altText || "Variant image"}
                                className="w-12 h-12 object-cover rounded-md border border-black/10"
                              />
                              <button
                                type="button"
                                onClick={() => handleVariantImageRemove(vIndex)}
                                className="absolute -top-1 -right-1 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="border border-dashed border-black/20 p-2 rounded-lg text-[10px] text-muted cursor-pointer hover:border-black/30">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleVariantImageChange(vIndex, e.target.files?.[0] || null)}
                              />
                            </label>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="relative inline-block w-24">
                          <span className="absolute left-3 top-2 text-[10px] text-muted">$</span>
                          <input 
                            type="text"
                            value={v.price}
                            onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)}
                            className="bg-white border border-black/5 rounded-md pl-6 pr-2 py-1.5 text-xs w-full focus:outline-none focus:border-black/20 font-mono"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <input 
                          type="text"
                          value={v.quantity}
                          onChange={(e) => handleVariantChange(vIndex, 'quantity', e.target.value)}
                          className="bg-white border border-black/5 rounded-md px-2 py-1.5 text-xs w-16 text-center focus:outline-none focus:border-black/20 font-mono"
                        />
                      </td>
                      <td className="px-6 py-6 text-center">
                        <input 
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(vIndex, 'sku', e.target.value)}
                          className="bg-white border border-black/5 rounded-md px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-black/20 font-mono"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
                        {formData.variants.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveVariant(vIndex)}
                            className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Status and Visibility */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" /> Production Status
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Product status</label>
                <div className="relative group/select">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 appearance-none font-semibold"
                  >
                    <option value="ACTIVE">Active (Live)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-black/20 pointer-events-none group-hover/select:text-black transition-colors" />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Market availability</span>
                  <span className="font-bold text-green-500">Live</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Shopify sync</span>
                  <span className="font-bold text-blue-500">Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" /> Organization
            </h3>

            <div className="space-y-4 font-inter">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider text-[9px]">Category / Selection</label>
                <CollectionSelector 
                  collections={collections}
                  selectedId={formData.collections[0]}
                  onSelect={(collection) => {
                    setFormData({
                      ...formData,
                      category: collection ? collection.title : "",
                      collections: collection ? [collection.id] : []
                    });
                  }}
                  isLoading={isFetchingCollections}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider text-[9px]">Industrial Vendor</label>
                <input 
                  type="text" 
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  placeholder="Brand / Merchant"
                  className="w-full px-4 py-2 bg-surface border border-black/5 rounded-lg text-sm focus:outline-none focus:border-black/20 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Strategic Info */}
          <div className="bg-black text-white rounded-2xl p-8 shadow-xl space-y-4">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Product Analytics</h4>
            <p className="text-xs leading-relaxed opacity-80">
              Every detail is synchronized across the global inventory fabric. Highline Industry ensures each variation is processed with real-time operational transparency.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Sync operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-black/5 z-40">
        <div className="max-w-6xl mx-auto flex justify-end gap-3 px-4">
          <Link 
            href="/dashboard/admin/products"
            className="px-6 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-semibold hover:bg-surface transition-all"
          >
            Discard
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-10 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-black/80 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

// --- Custom Components ---

function CollectionSelector({ collections, selectedId, onSelect, isLoading }: { 
  collections: any[], 
  selectedId: string, 
  onSelect: (c: any) => void,
  isLoading: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCollection = collections.find(c => c.id === selectedId);

  // Organize hierarchy
  const roots = collections.filter(c => !c.metafield?.value);
  const getChildren = (parentId: string) => collections.filter(c => c.metafield?.value === parentId);

  // Flat list for searching
  const filteredCollections = search 
    ? collections.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-inter" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-2 bg-surface border border-black/5 rounded-lg text-sm focus:outline-none hover:border-black/20 transition-all group"
      >
        <span className={selectedCollection ? "font-semibold text-[#111]" : "text-muted"}>
          {isLoading ? "Fetching infra..." : (selectedCollection?.title || "Select Collection")}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-black/20 group-hover:text-black transition-all ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          <div className="p-2 border-b border-black/5 bg-surface/50">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collections..."
              className="w-full px-3 py-1.5 bg-white border border-black/5 rounded-md text-xs focus:outline-none focus:border-black/20 transition-all"
            />
          </div>

          <div className="max-h-62.5 overflow-y-auto p-1 space-y-0.5">
            {!search ? (
              <>
                <button
                  type="button"
                  onClick={() => { onSelect(null); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-muted hover:bg-surface rounded-md transition-all"
                >
                  NONE
                </button>
                {roots.map(root => (
                  <div key={root.id}>
                    <button
                      type="button"
                      onClick={() => { onSelect(root); setIsOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex items-center gap-2 ${
                        selectedId === root.id ? 'bg-black text-white font-bold' : 'hover:bg-surface text-[#111] font-semibold'
                      }`}
                    >
                      <Layers className={`w-3 h-3 ${selectedId === root.id ? 'text-white' : 'text-blue-500'}`} />
                      {root.title}
                    </button>
                    {getChildren(root.id).map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => { onSelect(child); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex items-center gap-2 pl-7 relative ${
                          selectedId === child.id ? 'bg-black text-white font-bold' : 'hover:bg-surface text-muted font-medium'
                        }`}
                      >
                        <div className="absolute left-4 top-0 bottom-1/2 w-px bg-black/10" />
                        <div className="absolute left-4 top-1/2 w-2 h-px bg-black/10" />
                        {child.title}
                      </button>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <div className="space-y-0.5">
                {filteredCollections.length > 0 ? (
                  filteredCollections.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { onSelect(c); setIsOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-all flex items-center gap-2 ${
                        selectedId === c.id ? 'bg-black text-white font-bold' : 'hover:bg-surface text-[#111] font-medium'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No matching records</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

