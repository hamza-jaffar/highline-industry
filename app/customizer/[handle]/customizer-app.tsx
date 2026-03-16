"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/lib/store/hooks";
import { initCustomizer } from "@/lib/store/customizerSlice";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { useRouter } from "next/navigation";

import CustomizerLeftSidebar from "./left-sidebar";
import CustomizerRightSidebar from "./right-sidebar";
import CustomizerHeader from "./header";
import CenterCanvas from "./canvas";

export default function CustomizerApp({ product, configResult }: { product: any, configResult: any }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const designs = useAppSelector(state => state.customizer.designs);
    
    const [showExitDialog, setShowExitDialog] = useState(false);

    useEffect(() => {
        if (configResult.success && configResult.data && product) {
            dispatch(initCustomizer({ config: configResult.data, product }));
        }
    }, [configResult, product, dispatch]);

    // Added useEffect to warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (designs.length > 0) { // Assuming designs.length > 0 indicates unsaved changes
                e.preventDefault();
                e.returnValue = ''; // Standard way to trigger the browser's warning message
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [designs]); // Dependency array includes designs to re-run effect if designs change

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
