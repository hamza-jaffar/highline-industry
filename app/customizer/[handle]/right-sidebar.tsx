"use client";

import React from 'react';
import { Link2, ChevronDown } from "lucide-react";

const AttributeInput = ({ label, value, unit, suffix }: { label: string, value: string, unit?: string, suffix?: string }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="relative flex items-center bg-[#f5f6f7] rounded-lg h-10 px-3 border border-transparent focus-within:border-black/10 transition-all">
            <input
                type="text"
                defaultValue={value}
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
    return (
        <aside className="w-full h-full bg-white border-l border-black/5 flex flex-col overflow-hidden shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-black/5">
                <h2 className="text-xl font-black tracking-tight">Attributes</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Size Controls */}
                <section className="space-y-6">
                    <div className="flex items-end gap-3">
                        <AttributeInput label="Width" value="0" unit="px" />
                        <div className="mb-2 shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-300 hover:text-black">
                            <Link2 className="w-4 h-4" />
                        </div>
                        <AttributeInput label="Height" value="0" unit="px" />
                    </div>

                    <div className="flex gap-4">
                        <AttributeInput label="Rotate" value="0.0" suffix="°" />
                        <AttributeInput label="Scale" value="0.00" suffix="%" />
                    </div>
                </section>

                <div className="h-px bg-black/5" />

                {/* Layer Logic Placeholder */}
                <section className="space-y-4 filter grayscale">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Layer Stack</h3>
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center  border border-red-500 gap-4 p-4 rounded-xl bg-gray-100 animate-pulse border border-black/5">
                                <div className="w-10 h-10 bg-gray-500 rounded-lg animate-pulse" />
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-gray-500 rounded animate-pulse" />
                                    <div className="h-2 w-12 bg-gray-500 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom Help/Hints */}
            <div className="p-6 bg-[#fafafa] border-t border-black/5">
                <div className="flex items-center gap-3 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-normal">
                        Select an element on the canvas to edit properties.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default CustomizerRightSidebar;