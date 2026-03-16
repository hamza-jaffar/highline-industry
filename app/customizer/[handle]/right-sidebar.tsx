"use client";

import React from 'react';
import { Link2, ChevronDown, List, Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { updateElement, removeElement, selectElement, saveHistoryState } from "@/lib/store/customizerSlice";

const AttributeInput = ({ label, value, unit, suffix, onChange }: { label: string, value: string | number, unit?: string, suffix?: string, onChange?: (val: string) => void }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="relative flex items-center bg-[#f5f6f7] rounded-lg h-10 px-3 border border-transparent focus-within:border-black/10 transition-all">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="bg-transparent w-full text-sm font-bold outline-none text-black/80"
            />
            {unit && (
                <div className="flex items-center gap-1 text-[10px] font-black text-black/20 uppercase cursor-pointer hover:text-black/40 transition-colors">
                    {unit}
                    <ChevronDown className="w-3 h-3" />
                </div>
            )}
            {suffix && (
                <span className="text-[10px] font-black text-black/20 uppercase">{suffix}</span>
            )}
        </div>
    </div>
);

const CustomizerRightSidebar = () => {
    const dispatch = useAppDispatch();
    const selectedElementId = useAppSelector(state => state.customizer.selectedElementId);
    const selectedPart = useAppSelector(state => state.customizer.selectedPart);
    const designs = useAppSelector(state => state.customizer.designs);
    const config = useAppSelector(state => state.customizer.config);
    
    // Get all design parts from config
    const availableParts = config?.parts ? Object.keys(config.parts) : [];

    
    const currentDesigns = designs.filter(d => d.partName === selectedPart);
    const selectedElement = currentDesigns.find(d => d.id === selectedElementId);

    const handleUpdate = (updates: Partial<typeof selectedElement>) => {
        if (!selectedElementId) return;
        dispatch(updateElement({ id: selectedElementId, ...updates }));
    };

    const handleUpdateComplete = () => {
        dispatch(saveHistoryState());
    };

    return (
        <aside className="w-full max-w-78 h-full bg-white border-l border-black/5 flex flex-col overflow-hidden shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">Attributes</h2>
                {selectedElementId && (
                    <button 
                        onClick={() => {
                            dispatch(removeElement(selectedElementId));
                            dispatch(selectElement(null));
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-md transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Size Controls */}
                <section className={`space-y-6 ${!selectedElement ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                    <div className="flex items-end gap-3">
                        <AttributeInput 
                            label="Width" 
                            value={selectedElement?.width ? Math.round(selectedElement.width * selectedElement.scaleX) : 0} 
                            unit="px"
                            onChange={(val) => {
                                const num = parseFloat(val);
                                if (!isNaN(num) && selectedElement) {
                                    handleUpdate({ scaleX: num / selectedElement.width });
                                }
                            }}
                        />
                        <div className="mb-2 shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-300 hover:text-black">
                            <Link2 className="w-4 h-4" />
                        </div>
                        <AttributeInput 
                            label="Height" 
                            value={selectedElement?.height ? Math.round(selectedElement.height * selectedElement.scaleY) : 0} 
                            unit="px" 
                            onChange={(val) => {
                                const num = parseFloat(val);
                                if (!isNaN(num) && selectedElement) {
                                    handleUpdate({ scaleY: num / selectedElement.height });
                                }
                            }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <AttributeInput 
                            label="Rotate" 
                            value={selectedElement?.rotation ? Math.round(selectedElement.rotation) : 0} 
                            suffix="°" 
                            onChange={(val) => {
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                    handleUpdate({ rotation: num });
                                }
                            }}
                        />
                        <AttributeInput 
                            label="Opacity" 
                            value={100} 
                            suffix="%" 
                        />
                    </div>
                </section>

                {/* Specialized Content Controls */}
                {selectedElement?.type === 'text' && (
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Content</h3>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Text Content</label>
                            <textarea
                                key={selectedElement.id}
                                value={selectedElement.content}
                                onChange={(e) => {
                                    handleUpdate({ content: e.target.value });
                                }}
                                onBlur={handleUpdateComplete}
                                className="w-full h-24 bg-[#f5f6f7] rounded-xl p-3 text-sm font-semibold outline-none border border-transparent focus:border-black/10 transition-all resize-none"
                            />
                        </div>
                    </section>
                )}

                <div className="h-px bg-black/5" />

                {/* Move to View Controls */}
                {selectedElement && (
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Placement</h3>
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current View</label>
                            <div className="flex flex-wrap gap-2">
                                {availableParts.map(partKey => (
                                    <button
                                        key={partKey}
                                        onClick={() => {
                                            // When moving to a different part, we should probably clear the areaId 
                                            // or assign to the first available area in that part.
                                            const targetPartDef = config?.parts[partKey];
                                            const firstArea = targetPartDef?.areas.find(a => 
                                                a.allowedType === 'both' || a.allowedType === selectedElement.type
                                            );
                                            
                                            handleUpdate({ 
                                                partName: partKey,
                                                areaId: firstArea?.id 
                                            });
                                            handleUpdateComplete();
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                            selectedElement.partName === partKey
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-black/20'
                                        }`}
                                    >
                                        {config?.parts[partKey].name || partKey}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <div className="h-px bg-black/5" />

                {/* Layer Logic */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Layer Stack</h3>
                    <div className="space-y-2">
                        {currentDesigns.length === 0 && (
                            <div className="text-xs text-gray-400 font-medium py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                                No layers yet
                            </div>
                        )}
                        {[...currentDesigns].reverse().map(design => (
                            <div 
                                key={design.id} 
                                onClick={() => dispatch(selectElement(design.id))}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                    selectedElementId === design.id 
                                    ? 'border-black bg-black/5' 
                                    : 'border-black/5 hover:border-black/20 bg-white'
                                }`}
                            >
                                <div className="w-8 h-8 shrink-0 bg-white rounded-md border border-black/10 flex items-center justify-center overflow-hidden">
                                    {design.type === 'image' ? (
                                        <img src={design.content} alt="Layer" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs font-bold font-serif">T</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate">
                                        {design.type === 'text' ? design.content : 'Image Layer'}
                                    </div>
                                    <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">
                                        {design.type}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 text-gray-400">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(updateElement({ id: design.id, isLocked: !design.isLocked }));
                                            dispatch(saveHistoryState());
                                        }}
                                        className="p-1 hover:text-black hover:bg-white rounded transition-colors"
                                    >
                                        {design.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom Help/Hints */}
            {!selectedElementId && (
                <div className="p-6 bg-[#fafafa] border-t border-black/5">
                    <div className="flex items-center gap-3 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-normal">
                            Select an element on the canvas to edit properties.
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default CustomizerRightSidebar;