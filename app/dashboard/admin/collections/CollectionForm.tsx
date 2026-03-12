"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, X, ChevronDown, FolderOpen, Search } from "lucide-react";
import Link from "next/link";
import { getAdminCollections } from "@/app/actions/admin.action";
import Image from "next/image";

interface CollectionFormProps {
  initialData?: {
    id?: string;
    title: string;
    handle: string;
    description: string;
    parentId?: string;
    imageUrl?: string;
    imageBase64?: string;
    imageType?: string;
    imageName?: string;
  };
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

export default function CollectionForm({ initialData, onSubmit, isLoading, submitLabel }: CollectionFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {
    title: "",
    handle: "",
    description: "",
    parentId: "",
    imageUrl: ""
  });

  const [collections, setCollections] = useState<any[]>([]);
  const [isFetchingParent, setIsFetchingParent] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setIsFetchingParent(true);
    const result = await getAdminCollections(100);
    if (result.success) {
      // Filter out current collection if editing
      const filtered = result.data.edges.filter(({ node }: any) => node.id !== initialData?.id);
      setCollections(filtered);
    }
    setIsFetchingParent(false);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let submissionData = { ...formData };
    
    if (selectedFile) {
      const base64 = await toBase64(selectedFile);
      submissionData = {
        ...submissionData,
        imageBase64: base64,
        imageType: selectedFile.type,
        imageName: selectedFile.name
      };
    }
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111]">General Info</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111]">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Winter Essentials"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111]">Handle (URL Friendly)</label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. winter-essentials"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111]">Description</label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Collection description (HTML supported)..."
                  className="w-full px-4 py-3 bg-[#fafafa] border border-black/5 rounded-xl text-sm focus:outline-none focus:border-black/20 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111]">Collection Image</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111]">Upload Image</label>
                <div className="relative group/upload">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full border-2 border-dashed border-black/5 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-[#fafafa] group-hover/upload:border-black/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5">
                      <ImageIcon className="w-5 h-5 text-black/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-[#111]">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-[#737373] mt-1">PNG, JPG or GIF (max. 2MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              {previewUrl && (
                <div className="relative aspect-video rounded-xl border border-black/5 overflow-hidden bg-[#fafafa] group/preview">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setFormData({ ...formData, imageUrl: "" });
                      }}
                      className="p-2 bg-white rounded-full shadow-lg border border-black/10 hover:bg-red-50 hover:text-red-500 transition-all transform hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white border border-black/10 rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#737373] uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Organization
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111]">Parent Collection</label>
                <div className="relative group/dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-[#737373]" />
                    <input
                      type="text"
                      placeholder="Search parents..."
                      className="w-full pl-9 pr-4 py-2 bg-[#fafafa] border border-black/5 rounded-t-xl text-xs focus:outline-none focus:border-black/20 transition-all border-b-0"
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        setParentSearch(val);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-black/10 rounded-b-xl shadow-xl z-50 max-h-[300px] overflow-y-auto">
                      <div
                        onClick={() => {
                          setFormData({ ...formData, parentId: "" });
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 text-xs cursor-pointer hover:bg-[#fafafa] transition-all flex items-center gap-2 ${!formData.parentId ? 'bg-black/5 font-bold' : ''}`}
                      >
                        <FolderOpen className="w-3 h-3 opacity-40" />
                        None (Top Level)
                      </div>

                      {collections
                        .filter(({ node }) => node.title.toLowerCase().includes(parentSearch))
                        .slice(0, 10)
                        .map(({ node }) => (
                          <div
                            key={node.id}
                            onClick={() => {
                              setFormData({ ...formData, parentId: node.id });
                              setIsDropdownOpen(false);
                            }}
                            className={`px-4 py-3 text-xs cursor-pointer hover:bg-[#fafafa] transition-all flex items-center justify-between group ${formData.parentId === node.id ? 'bg-black/5 font-bold' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              {node.image?.url ? (
                                <Image height={20} width={20} src={node.image.url} alt={node.title} />
                              ) : (
                                <FolderOpen className="w-3 h-3 opacity-40" />
                              )}
                              {node.title}
                            </div>
                            <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-all font-mono">SELECT</span>
                          </div>
                        ))}

                      {collections.filter(({ node }) => node.title.toLowerCase().includes(parentSearch)).length === 0 && (
                        <div className="px-4 py-8 text-center text-[10px] text-[#737373] italic">
                          No matching collections found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Backdrop to close dropdown */}
                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                </div>

                {formData.parentId && !isDropdownOpen && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-lg border border-black/5">
                    <FolderOpen className="w-3 h-3 text-black/40" />
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                      {collections.find(({ node }) => node.id === formData.parentId)?.node.title || "Selected Parent"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, parentId: "" })}
                      className="ml-auto p-0.5 hover:bg-black/10 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-[#737373]">
                  Select a parent to create a collection hierarchy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-8 shadow-xl space-y-4">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Hierarchy Insight</h4>
            <p className="text-sm leading-relaxed opacity-80">
              Nesting enables industrial grouping. Sub-collections are linked via factory metafields for seamless deep-linking.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-black/5 z-30">
        <div className="max-w-6xl mx-auto flex justify-end gap-3">
          <Link
            href="/dashboard/admin/collections"
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
