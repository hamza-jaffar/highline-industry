"use client";

import { LogOut, ChevronDown, RefreshCw } from "lucide-react";

const CustomizerHeader = () => {
    return (
        <header className="h-14 bg-black text-white flex items-center justify-between px-4 z-50 overflow-hidden shrink-0">
            {/* Left Section: Exit and Title */}
            <div className="flex items-center gap-4">
                <button className="w-8 h-8 flex cursor-pointer items-center justify-center border border-white/20 rounded hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-6 bg-white/20 mx-1" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tracking-tight truncate max-w-[200px]">
                        Snow Washed Oversized T-Shirt
                    </span>
                    <button className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60">
                        <RefreshCw className="w-3.5 h-3.5 cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Right Section: Price and Save */}
            <div className="flex items-center gap-4">
                <div className="flex border border-white/100 items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors group">
                    <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold leading-none mb-1">Total Price:</p>
                        <p className="text-sm font-black leading-none">$9.99</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                </div>

                <button className="bg-white rounded-md cursor-pointer text-black h-12 px-6 text-sm hover:bg-white/90 active:scale-95 transition-all">
                    Save Design
                </button>
            </div>
        </header>
    );
};

export default CustomizerHeader;