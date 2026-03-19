"use client";

import ConfirmDialog from "@/components/admin/confirm-dialog";
import { LogOut, ChevronDown, RefreshCw, Palette, ArrowLeft, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setColor, resetCustomizer, setCurrentDesignId, setDirty } from "@/lib/store/customizerSlice";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { addItemToCart, getVariantIdByOptions } from "@/app/actions/cart.action";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { setCartOpen } from "@/lib/store/cartSlice";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    variant?: "danger" | "info";
}

const CustomizerHeader = ({ isMobile }: { isMobile?: boolean }) => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const handle = params.handle as string;

    const product = useAppSelector((state) => state.customizer.product);
    const colors = useAppSelector((state) => state.customizer.colors);
    const selectedColor = useAppSelector((state) => state.customizer.selectedColor);
    const priceConfig = useAppSelector((state) => state.customizer.priceConfig);
    const designs = useAppSelector((state) => state.customizer.designs);

    const totalPrice = (priceConfig.basePrice + priceConfig.additions).toFixed(2);

    const [isSaving, setIsSaving] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedSize, setSelectedSize] = useState("");
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps>({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        onConfirm: () => { },
        onCancel: () => { },
        isLoading: false,
        variant: "danger",
    });

    const handleBack = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Are you sure?",
            message: "You are about to exit the customizer. Are you sure?",
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            onConfirm: () => { router.back() },
            onCancel: () => { setConfirmDialog(prev => ({ ...prev, isOpen: false })) },
            isLoading: false,
            variant: "danger",
        })
    }

    const sizes = useMemo(() => {
        if (!product) return [];
        const allSizes = new Set<string>();
        product.variants.edges.forEach(({ node }: any) => {
            const sizeOption = node.selectedOptions.find((o: any) => o.name.toLowerCase() === "size");
            if (sizeOption) allSizes.add(sizeOption.value);
        });
        return Array.from(allSizes);
    }, [product]);

    const handleReset = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Reset Customizer?",
            message: "This will remove all your designs. This action cannot be undone.",
            confirmLabel: "Reset",
            cancelLabel: "Cancel",
            onConfirm: () => {
                dispatch(resetCustomizer());
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => { setConfirmDialog(prev => ({ ...prev, isOpen: false })) },
            isLoading: false,
            variant: "danger",
        })
    }

    const currentDesignId = useAppSelector((state) => state.customizer.currentDesignId);

    const handleSave = async (isSaveAs: boolean = false) => {
        console.log('handleSave called', { isSaveAs, currentDesignId });
        if (designs.length === 0) {
            toast.error("Add some designs before saving");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const designData: any = {
            productId: product?.id,
            productHandle: handle,
            color: selectedColor,
            elements: designs,
            price: totalPrice
        };

        // If not saving as new and we have a current ID, pass it for update
        if (!isSaveAs && currentDesignId) {
            designData.id = currentDesignId;
        }

        if (!session) {
            toast.info("Please sign in to save your design");
            sessionStorage.setItem('pending_design', JSON.stringify(designData));
            router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            const response = await fetch('/api/user-designs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(designData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.design) {
                    const newDesignId = data.design.id;
                    dispatch(setCurrentDesignId(newDesignId));
                    dispatch(setDirty(false));

                    // Sync designId to URL without full reload
                    const url = new URL(window.location.href);
                    url.searchParams.set('designId', newDesignId);
                    window.history.replaceState({}, '', url.toString());

                    toast.success(isSaveAs || !currentDesignId ? "Design saved successfully" : "Design updated successfully");

                    // Removed redirect to dashboard to allow continuous editing
                    // setTimeout(() => {
                    //    router.push('/dashboard/user');
                    // }, 1000);
                }
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to save design");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    }

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        setIsAddingToCart(true);
        try {
            // 1. Save or Update design first if needed
            // (We'll save every time to be sure we have the latest)
            let designIdToUse = currentDesignId;

            // If dirty or no design ID, save it
            if (true) { // Always save to ensure we have the latest for the cart
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                // If not logged in, we can't save to Supabase yet, 
                // but the requirements say designId and price in Supabase.
                // For guest users, we might need a different flow or force login.
                if (!session) {
                    toast.info("Please sign in to complete your purchase");
                    // Store intent to add to cart
                    const cartIntent = {
                        productId: product.id,
                        color: selectedColor,
                        size: selectedSize,
                        elements: designs,
                        price: totalPrice
                    };
                    sessionStorage.setItem('pending_cart_add', JSON.stringify(cartIntent));
                    router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
                    return;
                }

                const designData: any = {
                    productId: product.id,
                    productHandle: handle,
                    color: selectedColor,
                    elements: designs,
                    price: totalPrice
                };
                if (currentDesignId) designData.id = currentDesignId;

                const saveRes = await fetch('/api/user-designs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(designData),
                });

                if (saveRes.ok) {
                    const data = await saveRes.json();
                    designIdToUse = data.design.id;
                    dispatch(setCurrentDesignId(designIdToUse));
                    dispatch(setDirty(false));
                } else {
                    throw new Error("Failed to save design before adding to cart");
                }
            }

            if (!designIdToUse) throw new Error("Could not find design ID");

            // 2. Resolve Variant ID
            const variantId = await getVariantIdByOptions(handle, selectedColor, selectedSize);
            if (!variantId) throw new Error("Could not find a variant for this color and size");

            // 3. Add to Cart
            const result = await addItemToCart({
                productId: product.id,
                variantId: variantId,
                quantity: 1,
                designId: designIdToUse,
                isDesigned: true,
                price: Math.round(parseFloat(totalPrice) * 100),
                color: selectedColor,
                size: selectedSize
            });

            if (result.success) {
                toast.success("Added to cart successfully!");
                setShowSizeModal(false);
                dispatch(setCartOpen(true));
            } else {
                toast.error(result.error || "Failed to add to cart");
            }

        } catch (error: any) {
            console.error("Cart error:", error);
            toast.error(error.message || "An error occurred while adding to cart");
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Listen for save shortcuts via custom event
    useEffect(() => {
        const onSaveShortcut = (e: any) => {
            console.log('Header received save event', e.detail);
            handleSave(e.detail.isSaveAs);
        };
        window.addEventListener('customizer-save', onSaveShortcut);
        return () => window.removeEventListener('customizer-save', onSaveShortcut);
    }, [handleSave]);

    return (
        <header className="p-1 m-1 rounded-lg bg-black text-white flex items-center justify-between z-50 overflow-visible shrink-0 relative">
            {/* Left Section: Exit and Title */}
            <div className="flex items-center gap-2 md:gap-4 h-full">
                <button
                    onClick={handleBack}
                    className="h-10 px-3 flex cursor-pointer items-center justify-center border border-white/20 rounded-lg hover:bg-white/10 transition-colors group"
                >
                    <div className="flex items-center gap-1 text-white/50 group-hover:text-white transition-colors">
                        <LogOut className="w-4 h-4 rotate-180" />
                    </div>
                </button>

                <div className="flex items-center gap-3 ml-2">
                    <span className="text-sm md:text-base font-semibold tracking-tight text-white whitespace-nowrap">
                        {product?.title || "Loading..."}
                    </span>
                    <button
                        onClick={handleReset}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                        title="Reset design"
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5 cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Middle Section: Color Selection (Commented out) */}
            {/* {colors.length > 0 && (
                <div className={`${isMobile ? 'relative ml-2' : 'absolute left-1/2 -translate-x-1/2'} flex items-center`}>
                    <div className="relative">
                        <button
                            onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                            className="flex items-center gap-1.5 md:gap-2 bg-white/10 hover:bg-white/20 px-2 md:px-4 py-1.5 rounded-md cursor-pointer transition-colors"
                        >
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/30" style={{ backgroundColor: selectedColor.toLowerCase() }} />
                            {!isMobile && <span className="text-xs font-bold">{selectedColor}</span>}
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>

                        {isColorDropdownOpen && (
                            <div className={`absolute top-full mt-2 ${isMobile ? 'left-0' : 'left-1/2 -translate-x-1/2'} bg-white text-black p-2 rounded-xl shadow-2xl border border-black/10 min-w-40 z-50 animate-in fade-in zoom-in-95`}>
                                <div className="text-[10px] font-black uppercase text-gray-400 px-2 py-1 mb-1">Select Color</div>
                                <div className="space-y-1">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                dispatch(setColor(color));
                                                setIsColorDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color.toLowerCase() }} />
                                            <span className="text-sm font-semibold">{color}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )} */}

            {/* Right Section: Price and Save */}
            <div className="flex items-center gap-2">
                <div className="flex border border-white/20 items-center gap-3 cursor-pointer hover:bg-white/5 p-2 px-3 rounded-lg transition-colors group relative h-10">
                    <div className="flex flex-col justify-center">
                        <p className="text-[13px] text-white/60 font-medium leading-none mb-0.5">Total Price:</p>
                        <p className="text-xs font-bold leading-none text-white">${totalPrice}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors group-hover:rotate-180" />

                    {/* Additions Breakdown Tooltip */}
                    {priceConfig.additions > 0 && !isMobile && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black p-3 rounded-xl shadow-2xl border border-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 font-medium">Base Price</span>
                                <span className="font-bold">${priceConfig.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs pb-2 border-b border-black/10">
                                <span className="text-gray-500 font-medium">Customizations</span>
                                <span className="font-bold text-green-600">+${priceConfig.additions.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2">
                                <span className="font-bold">Total</span>
                                <span className="font-black">${totalPrice}</span>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="bg-white text-black h-10 px-4 rounded-lg cursor-pointer font-[505] hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Save Design"
                    )}
                </button>
                {/* <button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className={`bg-white rounded-r-md cursor-pointer text-black ${isMobile ? 'h-10 px-2' : 'h-12 px-2'} text-sm font-bold hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50`}
                    title="Save As New"
                >
                    <ChevronDown className="w-4 h-4 opacity-60" />
                </button> */}
            </div>

            {/* Size Selection Modal */}
            {showSizeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSizeModal(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-black/5 bg-gray-50/50">
                            <h3 className="text-lg font-black uppercase tracking-widest text-black">Select Size</h3>
                            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-tighter">Choose your size to add to cart</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-3 gap-2">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 rounded-xl text-sm font-bold cursor-pointer transition-all border-2 ${selectedSize === size
                                            ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-black/10 hover:text-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || !selectedSize}
                                className="w-full mt-6 py-4 bg-black rounded-xl text-sm font-semibold uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isAddingToCart ? (
                                    <div className="text-black flex gap-2 items-center">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Adding...
                                    </div>
                                ) : (
                                    "Confirm & Add"
                                )}
                            </button>

                            <button
                                onClick={() => setShowSizeModal(false)}
                                className="w-full mt-2 py-3 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmLabel={confirmDialog.confirmLabel}
                cancelLabel={confirmDialog.cancelLabel}
                onConfirm={confirmDialog.onConfirm}
                onCancel={confirmDialog.onCancel}
                isLoading={confirmDialog.isLoading}
                variant={confirmDialog.variant}
            />
        </header>
    );
};

export default CustomizerHeader;