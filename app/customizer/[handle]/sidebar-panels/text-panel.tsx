"use client";

import { Type } from 'lucide-react';
import React from 'react';
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addElement } from "@/lib/store/customizerSlice";

const TextPanel = () => {
    const dispatch = useAppDispatch();
    const selectedPart = useAppSelector(state => state.customizer.selectedPart);

    const config = useAppSelector(state => state.customizer.config);

    const handleAddHeading = () => {
        const partDef = config?.parts[selectedPart];
        const targetArea = partDef?.areas.find(a => a.allowedType === 'text' || a.allowedType === 'both');

        dispatch(addElement({
            id: `text-${Date.now()}`,
            type: 'text',
            partName: selectedPart,
            content: 'HEADING TEXT',
            x: 150, 
            y: 150,
            width: 200,
            height: 40,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            isLocked: false,
            fill: '#000000',
            fontFamily: 'Arial',
            areaId: targetArea?.id
        }));
    };

    return (
        <div className="space-y-6 w-full">
            <h4 className="text-[11px] font-black uppercase text-black tracking-[0.2em]">Add Text Options</h4>
            <button 
                onClick={handleAddHeading}
                className="w-full bg-black rounded-md text-white h-10 flex items-center justify-center gap-2 text-sm font-bold hover:bg-black/80 transition-all cursor-pointer"
            >
                <Type className="w-4 h-4" />
                Add a generic heading
            </button>
            <div className="space-y-3">
                <button 
                    onClick={handleAddHeading}
                    className="w-full h-12 border border-black/10 rounded-lg flex items-center justify-center font-black text-2xl hover:bg-black/5 transition-all cursor-pointer"
                >
                    Add heading
                </button>
                <button 
                    onClick={handleAddHeading}
                    className="w-full h-12 border border-black/10 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-black/5 transition-all cursor-pointer"
                >
                    Add subheading
                </button>
                <button 
                    onClick={handleAddHeading}
                    className="w-full h-12 border border-black/10 rounded-lg flex items-center justify-center text-sm hover:bg-black/5 transition-all cursor-pointer"
                >
                    Add body text
                </button>
            </div>
        </div>
    );
};

export default TextPanel;