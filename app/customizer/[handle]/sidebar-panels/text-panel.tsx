"use client";

import { useState } from 'react';
import { Type, Play } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addElement } from "@/lib/store/customizerSlice";

const FONTS = [
    { name: 'Modern Bold', family: 'var(--font-bebas-neue)', style: {} },
    { name: 'Playful Script', family: 'var(--font-dancing-script)', style: {} },
    { name: 'Heavy Block', family: 'var(--font-bungee)', style: {} },
    { name: 'Street Marker', family: 'var(--font-permanent-marker)', style: {} },
    { name: 'Retro Disco', family: 'var(--font-monoton)', style: {} },
    { name: 'Pixel Game', family: 'var(--font-press-start)', style: { fontSize: '10px' } },
    { name: 'Art Deco', family: 'var(--font-fascinate)', style: {} },
    { name: 'Elegant Sora', family: 'var(--font-sora)', style: { fontWeight: '800' } },
];


const TextPanel = () => {
    const dispatch = useAppDispatch();
    const selectedPart = useAppSelector(state => state.customizer.selectedPart);
    const config = useAppSelector(state => state.customizer.config);

    const [text, setText] = useState('Hello, World');
    const [selectedColor, setSelectedColor] = useState('#FF0000');

    const handleAddText = (fontFamily: string) => {
        if (!text.trim()) return;

        const partDef = config?.parts[selectedPart];
        const targetArea = partDef?.areas.find(a => a.allowedType === 'text' || a.allowedType === 'both');

        dispatch(addElement({
            id: `text-${Date.now()}`,
            type: 'text',
            partName: selectedPart,
            content: text,
            x: 100,
            y: 100,
            width: 300,
            height: 60,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            isLocked: false,
            fill: selectedColor,
            fontFamily: fontFamily.includes('var(') ? fontFamily.split('(--font-')[1].split(')')[0].replace(/-/g, ' ') : fontFamily,
            areaId: targetArea?.id
        }));
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-2 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Text Input Section */}
                <div className="space-y-4">
                    <div className="relative group">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter your text..."
                            className="w-full h-14 px-5 pr-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-black transition-all shadow-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Type className="w-5 h-5 text-gray-300 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Text Color</h4>
                            <div className="flex items-center gap-2">
                                <div className="relative group/color overflow-hidden w-6 h-6 rounded-lg border border-black/10 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                                    <input
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="absolute inset-[-4px] w-[140%] h-[140%] cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{selectedColor}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleAddText('var(--font-inter)')}
                        className="w-full bg-[#111] hover:bg-black text-white p-3 cursor-pointer rounded-lg flex items-center justify-center gap-3 text-[15px] font-semibold tracking-wider transition-all shadow-lg active:scale-[0.98]"
                    >
                        Create WordArt
                    </button>
                </div>

                {/* Font Previews Grid */}
                <div className="space-y-4 pt-4 border-t border-gray-50 text-center">
                    <h4 className="text-[11px] font-black uppercase text-gray-300 tracking-[0.2em]">Select Style</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {FONTS.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => handleAddText(font.family)}
                                className="w-full min-h-[80px] p-4 bg-white border border-gray-100 rounded-xl hover:border-black hover:shadow-md transition-all group flex flex-col items-center justify-center gap-2 overflow-hidden relative cursor-pointer"
                                style={{
                                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }}
                            >
                                <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors" />
                                <span
                                    className="text-2xl relative z-10 break-all px-2 line-clamp-1"
                                    style={{
                                        fontFamily: font.family,
                                        color: selectedColor,
                                        ...font.style,
                                        textShadow: selectedColor.toLowerCase() === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 0 rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {text || 'Sample'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextPanel;
