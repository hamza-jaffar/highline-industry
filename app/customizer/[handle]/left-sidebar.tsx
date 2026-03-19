"use client";

import {
    Upload,
    Image as ImageIcon,
    Type,
    Keyboard,
    Package,
    Shirt
} from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setTab } from '@/lib/store/customizerSlice';
import UploadPanel from './sidebar-panels/upload-panel';
import TextPanel from './sidebar-panels/text-panel';
import ShortcutsPanel from './sidebar-panels/shortcuts-panel';
import ProductPanel from "./sidebar-panels/product-panel";
import MockupPanel from "./sidebar-panels/mockup-panel";

type layers = 'mockup' | 'upload' | 'text' | 'shortcuts' | 'products';

const NAV_ITEMS: { id: layers; icon: any; label: string }[] = [
    { id: 'mockup', icon: Shirt, label: 'Mockup' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts' },
    { id: 'products', icon: Package, label: 'Product' }
];

const CustomizerLeftSidebar = ({ isMobile }: { isMobile?: boolean }) => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(state => state.customizer.activeTab);

    return (
        <div className="flex w-full h-full bg-gray-200 border-r border-black/5 overflow-hidden shrink-0">
            {/* Primary Navigation Rail */}
            {!isMobile && (
                <nav className="w-16 flex flex-col items-center py-2 gap-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => dispatch(setTab(item.id))}
                            className={`w-full py-4 flex flex-col cursor-pointer rounded-l-xl items-center justify-center gap-1.5 transition-all text-[#666] hover:text-black ${activeTab === item.id ? 'bg-white text-black' : ''
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        </button>
                    ))}
                </nav>
            )}

            {/* Contextual Panel */}
            <div className={`flex-1 overflow-hidden flex flex-col ${isMobile ? 'bg-[#f0f1f2]' : 'bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)]'}`}>
                <div className="p-2 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
                    {isMobile ? (
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                            {NAV_ITEMS.filter(i => i.id !== 'shortcuts').map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => dispatch(setTab(item.id))}
                                    className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 rounded-lg transition-all text-xs font-black ${activeTab === item.id
                                        ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-400 active:bg-black/5'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="tracking-tight">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <h3 className="font-bold text-sm uppercase tracking-wider px-2">{activeTab}</h3>
                    )}
                </div>

                <div className="flex-1 w-full overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'upload' ? (
                        <UploadPanel />
                    ) : activeTab === 'text' ? (
                        <TextPanel />
                    ) : activeTab === 'shortcuts' ? (
                        <ShortcutsPanel />
                    ) : activeTab === 'products' ? (
                        <ProductPanel />
                    ) : activeTab === 'mockup' ? (
                        <MockupPanel />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale-100 py-20 gap-4">
                            <ImageIcon className="w-12 h-12" />
                            <p className="text-xs font-bold uppercase tracking-widest">Panel for {activeTab}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomizerLeftSidebar;