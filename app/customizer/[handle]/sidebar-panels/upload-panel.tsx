"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addElement } from "@/lib/store/customizerSlice";

const UploadPanel = () => {
    const dispatch = useAppDispatch();
    const selectedPart = useAppSelector(state => state.customizer.selectedPart);
    const config = useAppSelector(state => state.customizer.config);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target?.result && typeof event.target.result === 'string') {
                const img = new Image();
                img.onload = () => {
                    const initialWidth = 150;
                    const scale = initialWidth / img.width;
                    const initialHeight = img.height * scale;

                    const partDef = config?.parts[selectedPart];
                    const targetArea = partDef?.areas.find(a => a.allowedType === 'image' || a.allowedType === 'both');

                    dispatch(addElement({
                        id: `img-${Date.now()}`,
                        type: 'image',
                        partName: selectedPart,
                        content: event.target?.result as string,
                        x: 175, 
                        y: 175,
                        width: initialWidth,
                        height: initialHeight,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        isLocked: false,
                        areaId: targetArea?.id
                    }));
                    setIsUploading(false);
                };
                img.src = event.target.result;
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 w-full">
            <h4 className="text-[11px] font-black uppercase text-black tracking-[0.2em]">Upload Images</h4>
            
            <label className="w-full bg-black rounded-md text-white h-10 flex items-center justify-center gap-2 text-sm font-bold hover:bg-black/80 transition-all cursor-pointer">
                {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Upload'}
                <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handleFileUpload}
                    className="hidden" 
                    disabled={isUploading}
                />
            </label>

            <div className="pt-10 flex flex-col items-center text-center gap-4 py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <UploadCloud className="w-8 h-8 text-gray-300" />
                <div className="space-y-1">
                    <p className="text-xs font-bold">Select files to upload</p>
                    <p className="text-[10px] text-gray-400">JPG or PNG, max 50MB</p>
                </div>
            </div>
        </div>
    );
};

export default UploadPanel;