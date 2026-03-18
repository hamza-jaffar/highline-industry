"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { getAdminProduct, saveCustomizerConfig, getCustomizerConfig } from "@/app/actions/admin";
import CustomizerSidebar from "./customizer-sidebar";
import { Loader2, Upload, Trash2, Crosshair, CheckCircle2, AlertCircle, X } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Area, CustomizerState } from "./types";
import ConfirmDialog from "@/components/admin/confirm-dialog";

const AreaSelector = dynamic(() => import("./area-selector"), { ssr: false }) as any;

const CustomizerPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<string>("Front");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeletingPart, setIsDeletingPart] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [state, setState] = useState<CustomizerState>({
    parts: {
      "Front": { id: "front", name: "Front", isCommon: false, areas: [] },
      "Back": { id: "back", name: "Back", isCommon: false, areas: [] },
    },
    commonImages: {},
    colorImages: {}
  });

  useEffect(() => {
    const fetchProductAndConfig = async () => {
      setIsLoading(true);
      const productId = `gid://shopify/Product/${id}`;

      const [productResult, configResult] = await Promise.all([
        getAdminProduct(productId),
        getCustomizerConfig(productId)
      ]);

      if (productResult.success) {
        setProduct(productResult.data);
        const fetchedColors = Array.from(new Set(
          productResult.data.variants.edges
            .map(({ node }: any) => node.selectedOptions.find((o: any) => o.name.toLowerCase() === "color")?.value)
            .filter(Boolean)
        )) as string[];

        if (fetchedColors.length > 0) {
          setSelectedColor(fetchedColors[0]);
        }
      } else {
        toast.error("Failed to load product");
      }

      if (configResult.success && configResult.data) {
        setState(prev => ({
          ...prev,
          parts: { ...prev.parts, ...(configResult.data.parts || {}) },
          commonImages: { ...prev.commonImages, ...(configResult.data.commonImages || {}) },
          colorImages: { ...prev.colorImages, ...(configResult.data.colorImages || {}) }
        }));
      }

      setIsLoading(false);
    };
    fetchProductAndConfig();
  }, [id]);

  const colors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(
      product.variants.edges
        .map(({ node }: any) => node.selectedOptions.find((o: any) => o.name.toLowerCase() === "color")?.value)
        .filter(Boolean)
    )) as string[];
  }, [product]);

  const partDef = state.parts[selectedPart];
  const currentImageUrl = partDef?.isCommon
    ? state.commonImages[selectedPart]
    : state.colorImages[selectedColor]?.[selectedPart];

  useEffect(() => {
    setSelectedAreaId(null);
  }, [selectedPart, selectedColor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedColor || !selectedPart) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== 500 || img.height !== 500) {
        toast.error("Image size must be exactly 500x500px");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setState(prev => {
          if (partDef.isCommon) {
            return {
              ...prev,
              commonImages: { ...prev.commonImages, [selectedPart]: base64 }
            };
          } else {
            return {
              ...prev,
              colorImages: {
                ...prev.colorImages,
                [selectedColor]: {
                  ...prev.colorImages[selectedColor],
                  [selectedPart]: base64
                }
              }
            };
          }
        });
        // Reset input value to allow uploading the same file again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    };
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setState(prev => {
      if (partDef.isCommon) {
        const newCommonImages = { ...prev.commonImages };
        delete newCommonImages[selectedPart];
        return { ...prev, commonImages: newCommonImages };
      } else {
        const newColorImages = { ...prev.colorImages };
        if (newColorImages[selectedColor]) {
          delete newColorImages[selectedColor][selectedPart];
        }
        return { ...prev, colorImages: newColorImages };
      }
    });
  };

  const deletePart = () => {
    if (!selectedPart) return;
    setIsDeletingPart(true);
    setState(prev => {
      const newParts = { ...prev.parts };
      delete newParts[selectedPart];

      const newCommonImages = { ...prev.commonImages };
      delete newCommonImages[selectedPart];

      const newColorImages = { ...prev.colorImages };
      Object.keys(newColorImages).forEach(color => {
        delete newColorImages[color][selectedPart];
      });

      return {
        ...prev,
        parts: newParts,
        commonImages: newCommonImages,
        colorImages: newColorImages
      };
    });

    const remainingParts = Object.keys(state.parts).filter(n => n !== selectedPart);
    if (remainingParts.length > 1) {
      setSelectedPart(remainingParts[0]);
    } else {
      setSelectedPart("");
    }
    setShowDeleteConfirm(false);
    setIsDeletingPart(false);
    toast.success(`Part "${selectedPart}" deleted`);
  };

  const updateAreas = (areas: Area[]) => {
    setState(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [selectedPart]: {
          ...prev.parts[selectedPart],
          areas
        }
      }
    }));
  };

  const updateAreaMetadata = (id: string, metadata: Partial<Area>) => {
    setState(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [selectedPart]: {
          ...prev.parts[selectedPart],
          areas: prev.parts[selectedPart].areas.map(a => a.id === id ? { ...a, ...metadata } : a)
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const result = await saveCustomizerConfig(`gid://shopify/Product/${id}`, state);
    if (result.success) {
      toast.success("Configuration saved successfully");
    } else {
      toast.error(result.error || "Failed to save configuration");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center flex-col gap-4 text-center p-8">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Product Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn't retrieve the product data for ID: <span className="font-mono font-bold text-black">{id}</span>.
            The product might have been deleted or the ID is incorrect.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/80 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const selectedArea = partDef?.areas.find(a => a.id === selectedAreaId);

  return (
    <section className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50/20">
      <CustomizerSidebar
        colors={colors}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedPart={selectedPart}
        setSelectedPart={setSelectedPart}
        state={state}
        setState={setState}
      />

      <main className="flex-1 relative flex flex-col bg-white overflow-hidden">
        <header className="p-6 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">{product.title}</h1>
            <p className="text-sm text-gray-400 font-medium">
              Configure <span className="font-bold text-black">{selectedPart}</span>
              {!partDef?.isCommon && <> for <span className="px-2 py-0.5 bg-black/5 rounded-md text-black lowercase">{selectedColor}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-green-700 border border-green-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Size Locked: 500x500px
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete Part
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-black text-white rounded-lg cursor-pointer text-sm font-bold hover:bg-black/80 transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-auto bg-gray-50/30 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8 md:p-12">
            {currentImageUrl ? (
              <div className="relative group p-4 bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5 animate-in zoom-in-95 duration-700">
                <AreaSelector
                  imageUrl={currentImageUrl}
                  areas={partDef?.areas || []}
                  onUpdateAreas={updateAreas}
                  selectedAreaId={selectedAreaId}
                  onSelectArea={setSelectedAreaId}
                />
                <div className="absolute -top-4 -right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={handleReplaceImage}
                    title="Replace Image"
                    className="p-3 bg-white text-black rounded-2xl shadow-2xl border border-black/5 hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={removeImage}
                    title="Remove Image"
                    className="p-3 bg-white text-red-500 rounded-2xl shadow-2xl border border-black/5 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-lg aspect-square border-2 border-dashed border-black/5 rounded-xl cursor-pointer hover:border-black/20 hover:bg-white transition-all group bg-white/50 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] pointer-events-none" />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                  <div className="p-8 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                    <Upload className="w-12 h-12 text-black/40 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-black">Upload {selectedPart} Image</h3>
                  <p className="text-sm text-gray-400 font-medium mb-10 text-center px-8">500 x 500 px PNG/JPG recommended</p>
                  <div className="px-10 py-4 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl group-hover:shadow-black/20 transition-all duration-300 transform group-hover:-translate-y-1">
                    Choose File
                  </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </label>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="mt-auto p-8 border-t border-black/5 flex items-center gap-6 bg-white/80 backdrop-blur-md">
            <div className="flex-1 flex items-center gap-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              <div className="p-3 bg-black text-white rounded-lg shadow-lg shadow-black/10">
                <Crosshair className="w-4 h-4" />
              </div>
              <span>Click and drag on the image to define <span className="text-black font-black">synchronized zones</span></span>
            </div>
          </div>
        </div>

        {/* Floating/Slide-out Area Settings */}
        {selectedArea && (
          <div className="absolute border shadow-4xl rounded-2xl top-0 right-0 w-80 h-full bg-white border-black/30 z-30 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-black">
                  <div className="p-2.5 bg-black text-white rounded-lg">
                    <Crosshair className="w-4 h-4 cursor-pointer" />
                  </div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.15em]">Zone Settings</h3>
                </div>
                <button onClick={() => setSelectedAreaId(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-gray-400 cursor-pointer" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Allowed Media</label>
                  <div className="grid grid-cols-1 gap-2">
                    {["image", "text", "both"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateAreaMetadata(selectedArea.id, { allowedType: type as any })}
                        className={`px-5 py-4 rounded-lg cursor-pointer text-[11px] font-black uppercase tracking-widest transition-all border-2 text-left flex items-center justify-between group ${selectedArea.allowedType === type
                          ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-black/10 hover:text-black'
                          }`}
                      >
                        {type}
                        {selectedArea.allowedType === type && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-black/5">
                  {(selectedArea.allowedType === "image" || selectedArea.allowedType === "both") && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Image Surcharge ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">$</span>
                        <input
                          type="number"
                          className="w-full bg-gray-50 border border-black/10 rounded-lg active:border-black/10 focus:border-black/10 pl-8 pr-4 py-4 text-sm font-bold"
                          value={selectedArea.imagePrice}
                          onChange={(e) => updateAreaMetadata(selectedArea.id, { imagePrice: Number(e.target.value) })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                  {(selectedArea.allowedType === "text" || selectedArea.allowedType === "both") && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Text Surcharge ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">$</span>
                        <input
                          type="number"
                          className="w-full bg-gray-50 border border-black/10 rounded-lg active:border-black/10 focus:border-black/10 pl-8 pr-4 py-4 text-sm font-bold"
                          value={selectedArea.textPrice}
                          onChange={(e) => updateAreaMetadata(selectedArea.id, { textPrice: Number(e.target.value) })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    updateAreas(partDef.areas.filter(a => a.id !== selectedArea.id));
                    setSelectedAreaId(null);
                  }}
                  className="w-full py-4 text-white text-[10px] font-black uppercase tracking-widest border-2 border-red-50 bg-red-500 hover:bg-red-600 cursor-pointer rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Zone
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Part"
        message={`Are you sure you want to delete the part "${selectedPart}"? This will also remove all images and zones associated with this part across all colors.`}
        confirmLabel="Delete Part"
        onConfirm={deletePart}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeletingPart}
        variant="danger"
      />
    </section>
  );
};

export default CustomizerPage;
