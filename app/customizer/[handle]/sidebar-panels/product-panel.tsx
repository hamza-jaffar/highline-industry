"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setColor } from "@/lib/store/customizerSlice";
import { Check, Info, X } from "lucide-react";
import { setTab } from "@/lib/store/customizerSlice";

const ProductPanel = () => {
    const dispatch = useAppDispatch();
    const product = useAppSelector(state => state.customizer.product);
    const colors = useAppSelector(state => state.customizer.colors);
    const selectedColor = useAppSelector(state => state.customizer.selectedColor);
    const priceConfig = useAppSelector(state => state.customizer.priceConfig);

    if (!product) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Product Header */}
                <section>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col flex-1">
                            <h3 className="text-xl font-black tracking-tight text-black uppercase">
                                {product.title}
                            </h3>
                            <div className="w-fit bg-black text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest mt-1">
                                ${priceConfig.basePrice}
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch(setTab(''))}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    {product.description && (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                            {product.description}
                        </p>
                    )}
                </section>

                {/* Color Selection */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            Select Color
                        </label>
                        <span className="text-[10px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded uppercase">
                            {selectedColor}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => dispatch(setColor(color))}
                                className={`group relative w-10 h-10 rounded-md transition-all cursor-pointer duration-300 ${selectedColor === color
                                    ? 'scale-110 shadow-lg'
                                    : 'hover:scale-105 hover:shadow-md'
                                    }`}
                                title={color}
                            >
                                <div
                                    className="w-full h-full rounded-xl border border-black/5"
                                    style={{ backgroundColor: color.toLowerCase() }}
                                />
                                {selectedColor === color && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className={`w-4 h-4 ${['white', 'yellow', 'ivory'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'}`} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Size Selection */}
                {/* <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            Select Size
                        </label>
                        <span className="text-[10px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded uppercase">
                            Guide
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                            <button
                                key={size}
                                className="py-2.5 rounded-xl text-[11px] font-black border-2 border-black/5 hover:border-black/20 hover:bg-gray-50 transition-all uppercase"
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </section> */}

                {/* Additional Details */}
                <section className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-black/20 cursor-pointer">
                        <Info className="w-4 h-4 text-black/40" />
                        <div>
                            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-0.5">Premium Fabric</p>
                            <p className="text-[9px] text-gray-400 font-bold leading-tight">100% Cotton, 240 GSM heavy-weight fabric for comfort.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-black/20 cursor-pointer">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Fit</p>
                            <p className="text-[10px] font-bold text-black uppercase">True to size</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-black/20 cursor-pointer">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping</p>
                            <p className="text-[10px] font-bold text-black uppercase">2-4 Business Days</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom Footer Details */}
            <div className="mt-auto p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Variant</p>
                        <p className="text-xs font-bold text-black uppercase">{selectedColor} Selection</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Cost</p>
                        <p className="text-sm font-black text-black">${priceConfig.basePrice}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPanel;