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
    redo
} from "@/lib/store/customizerSlice";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import CustomizerLeftSidebar from "./left-sidebar";
import CustomizerRightSidebar from "./right-sidebar";
import CustomizerHeader from "./header";
import CenterCanvas from "./canvas";

export default function CustomizerApp({ product, configResult }: { product: any, configResult: any }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const designId = searchParams.get('designId');
    const designs = useAppSelector(state => state.customizer.designs);
    
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
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch]);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Global Header */}
            <CustomizerHeader />

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden">
                {/* Navigation & Assets */}
                <CustomizerLeftSidebar />

                {/* Visual Workspace */}
                <CenterCanvas />

                {/* Transformer / Attributes */}
                <CustomizerRightSidebar />
            </main>

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
