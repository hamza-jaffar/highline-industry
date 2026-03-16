"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { 
    initCustomizer, 
    setTab, 
    removeCurrentElement, 
    loadDesign,
    copyElement,
    pasteElement,
    duplicateCurrentElement,
    undo,
    redo,
    setCurrentDesignId,
    DesignElement
} from "@/lib/store/customizerSlice";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

import CustomizerLeftSidebar from "./left-sidebar";
import CustomizerRightSidebar from "./right-sidebar";
import CustomizerHeader from "./header";
import CenterCanvas from "./canvas";
import MobileNav from "./mobile-nav";

export default function CustomizerApp({ product, configResult }: { product: any, configResult: any }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const designId = searchParams.get('designId');
    const isDirty = useAppSelector(state => state.customizer.isDirty);
    const designs = useAppSelector(state => state.customizer.designs);
    const activeTab = useAppSelector(state => state.customizer.activeTab);
    const selectedElementId = useAppSelector(state => state.customizer.selectedElementId);
    
    const [showExitDialog, setShowExitDialog] = useState(false);

    useEffect(() => {
        if (configResult.success && configResult.data && product) {
            dispatch(initCustomizer({ config: configResult.data, product }));
            
            // Recovery logic
            // Recovery / Loading logic
            const pendingDesign = sessionStorage.getItem('pending_design');
            
            if (designId) {
                // Fetch design from API
                fetch(`/api/user-designs?id=${designId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.design) {
                            try {
                                const elements = JSON.parse(data.design.elements);
                                dispatch(loadDesign(elements));
                                dispatch(setCurrentDesignId(data.design.id));
                                if (data.design.color) {
                                    // Optionally set color if different
                                }
                                toast.success("Design loaded successfully");
                            } catch (e) {
                                console.error("Error parsing design elements:", e);
                                toast.error("Corrupted design data");
                            }
                        } else {
                            toast.error("Failed to load design");
                        }
                    })
                    .catch(e => {
                        console.error("Error loading design:", e);
                        toast.error("Error loading design");
                    });
            } else if (pendingDesign) {
                try {
                    const parsed = JSON.parse(pendingDesign);
                    if (parsed.productId === product.id) {
                        dispatch(loadDesign(parsed.elements));
                        sessionStorage.removeItem('pending_design');
                        toast.success("Unsaved design restored");
                    }
                } catch (e) {
                    console.error("Failed to recover design", e);
                }
            }
        }
    }, [configResult, product, dispatch, designId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
                return;
            }

            if (e.key === '1') dispatch(setTab('upload'));
            if (e.key === '2') dispatch(setTab('text'));
            if (e.key === '3') dispatch(setTab('shortcuts'));
            
            // Edit actions
            if (e.key === 'Delete' || e.key === 'Backspace') {
                dispatch(removeCurrentElement());
            }

            // Clipboard and History
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'c':
                        e.preventDefault();
                        dispatch(copyElement());
                        break;
                    case 'v':
                        e.preventDefault();
                        dispatch(pasteElement());
                        break;
                    case 'd':
                        e.preventDefault();
                        dispatch(duplicateCurrentElement());
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            dispatch(redo());
                        } else {
                            dispatch(undo());
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        dispatch(redo());
                        break;
                    case 's':
                        e.preventDefault();
                        console.log('Save shortcut triggered', e.shiftKey ? 'Save As' : 'Save');
                        window.dispatchEvent(new CustomEvent('customizer-save', { 
                            detail: { isSaveAs: e.shiftKey } 
                        }));
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch]);

    // Handle beforeunload to prevent data loss
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'; 
                return 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#f5f6f7]">
            {/* Global Header */}
            <CustomizerHeader isMobile={isMobile} />

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Desktop Navigation & Assets */}
                <div className="hidden md:block w-1/4 h-full shrink-0">
                    <CustomizerLeftSidebar isMobile={isMobile} />
                </div>

                {/* Visual Workspace */}
                <div className="flex-1 relative min-h-0 h-full">
                    <CenterCanvas isMobile={isMobile} />
                </div>

                {/* Desktop Transformer / Attributes */}
                <div className="hidden md:block w-full max-w-78 h-full shrink-0">
                    <CustomizerRightSidebar isMobile={isMobile} />
                </div>

                {/* Mobile Overlays/Drawers */}
                {isMobile && activeTab && (
                    <>
                        <div 
                            className="absolute inset-0 bg-black/20 z-30 md:hidden animate-in fade-in duration-300" 
                            onClick={() => dispatch(setTab(''))}
                        />
                        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white md:hidden animate-in slide-in-from-bottom duration-300 h-[80%] rounded-t-3xl shadow-2xl overflow-hidden">
                            <div className="flex flex-col h-full bg-[#f0f1f2]">
                                <div className="h-14 flex items-center justify-between px-6 border-b border-black/5 bg-white shrink-0">
                                    <span className="text-xs font-black uppercase tracking-widest">{activeTab}</span>
                                    <button 
                                        onClick={() => dispatch(setTab(''))}
                                        className="p-2 hover:bg-black/5 rounded-full flex items-center gap-1.5 text-black/60"
                                    >
                                        <span className="text-[11px] font-black">DONE</span>
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {activeTab === 'layers' ? (
                                        <CustomizerRightSidebar isMobile={isMobile} />
                                    ) : (
                                        <CustomizerLeftSidebar isMobile={isMobile} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Mobile Attributes Overlay */}
                {isMobile && selectedElementId && !activeTab && (
                    <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-black/10 max-h-[60%] overflow-y-auto animate-in slide-in-from-bottom duration-300 rounded-t-2xl shadow-2xl">
                        <CustomizerRightSidebar isMobile={isMobile} />
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            {isMobile && <MobileNav />}

            <ConfirmDialog 
                isOpen={showExitDialog}
                title="Unsaved Changes"
                message="You have unsaved design changes. Are you sure you want to leave?"
                confirmLabel="Leave Anyway"
                cancelLabel="Stay"
                onConfirm={() => {
                    setShowExitDialog(false);
                    router.back();
                }}
                onCancel={() => setShowExitDialog(false)}
                variant="danger"
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.1);
                }
            `}} />
        </div>
    );
}
