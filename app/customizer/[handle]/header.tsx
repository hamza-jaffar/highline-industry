"use client";

import ConfirmDialog from "@/components/admin/confirm-dialog";
import { LogOut, ChevronDown, RefreshCw, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setColor, resetCustomizer } from "@/lib/store/customizerSlice";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useParams } from "next/navigation";

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

const CustomizerHeader = () => {
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

    const handleSave = async () => {
        if (designs.length === 0) {
            toast.error("Add some designs before saving");
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        const designData = {
            productId: product?.id,
            productHandle: handle,
            color: selectedColor,
            elements: designs,
        };

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
                toast.success("Design saved successfully");
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

    return (
        <header className="h-14 bg-black text-white flex items-center justify-between px-4 z-50 overflow-visible shrink-0 relative">
            {/* Left Section: Exit and Title */}
            <div className="flex items-center gap-4">
                <button onClick={handleBack} className="w-8 h-8 flex cursor-pointer items-center justify-center border border-white/20 rounded hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-6 bg-white/20 mx-1" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tracking-tight truncate max-w-[250px]">
                        {product?.title || "Loading..."}
                    </span>
                    <button
                        onClick={handleReset}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60"
                        title="Reset design"
                    >
                        <RefreshCw className="w-3.5 h-3.5 cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Middle Section: Color Selection */}
            {colors.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    <div className="relative">
                        <button
                            onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-md cursor-pointer transition-colors"
                        >
                            <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: selectedColor.toLowerCase() }} />
                            <span className="text-xs font-bold">{selectedColor}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </button>

                        {isColorDropdownOpen && (
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded-xl shadow-2xl border border-black/10 min-w-40 z-50 animate-in fade-in zoom-in-95">
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
            )}

            {/* Right Section: Price and Save */}
            <div className="flex items-center gap-2">
                <div className="flex border border-white/50 items-center gap-2 h-12 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors group relative">
                    <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold leading-none mb-1">Total Price:</p>
                        <p className="text-sm font-black leading-none">${totalPrice}</p>
                    </div>
                    {/* Additions Breakdown Tooltip */}
                    {priceConfig.additions > 0 && (
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
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white rounded-md cursor-pointer text-black h-12 px-6 text-sm font-bold hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Design"}
                </button>
            </div>
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