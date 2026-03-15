"use client";

import {
    X,
    RotateCcw,
    RotateCw,
    Grid,
    Maximize2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

const CenterCanvas = () => {
    return (
        <div className="bg-[#f5f6f7] w-full relative flex flex-col overflow-hidden">
            {/* Top Canvas Toolbar */}
            <div className="h-14 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-6">

                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                        <button className="p-1.5 hover:bg-white rounded-md transition-all text-gray-300 hover:text-black hover:shadow-sm">
                            <RotateCcw className="w-4 h-4 cursor-pointer" />
                        </button>
                        <button className="p-1.5 hover:bg-white rounded-md transition-all text-gray-300 hover:text-black hover:shadow-sm">
                            <RotateCw className="w-4 h-4 cursor-pointer" />
                        </button>
                    </div>
                    <div className="w-[1px] h-6 bg-black/5 mx-2" />
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
                        <Grid className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
                        <Maximize2 className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center p-12 lg:p-24 overflow-hidden">
            </div>
        </div>
    );
};

export default CenterCanvas;
