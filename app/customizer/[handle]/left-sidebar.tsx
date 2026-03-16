"use client";

import React, { useState } from 'react';
import {
    Upload,
    Image as ImageIcon,
    Type,
    Package,
    Heart,
    AlertCircle,
    HelpCircle,
    X,
    Plus,
    UploadCloud,
    Keyboard
} from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setTab } from '@/lib/store/customizerSlice';
import UploadPanel from './sidebar-panels/upload-panel';
import TextPanel from './sidebar-panels/text-panel';
import ShortcutsPanel from './sidebar-panels/shortcuts-panel';

const NAV_ITEMS: { id: 'upload' | 'text' | 'shortcuts'; icon: any; label: string }[] = [
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts' },
];

const CustomizerLeftSidebar = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(state => state.customizer.activeTab);

    return (
        <div className="flex w-1/4 h-full bg-[#f0f1f2] border-r border-black/5 overflow-hidden shrink-0">
            {/* Primary Navigation Rail */}
            <nav className="w-16 flex flex-col items-center py-2 gap-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => dispatch(setTab(item.id))}
                        className={`w-full py-4 flex flex-col cursor-pointer items-center justify-center gap-1.5 transition-all text-[#666] hover:text-black ${activeTab === item.id ? 'bg-white text-black' : ''
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium leading-none">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Contextual Panel */}
            <div className="w-full bg-white flex flex-col border-l border-black/5 shadow-[20px_0_40px_rgba(0,0,0,0.02)] translate-x-0 transition-transform duration-300">
                <div className="p-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-wider">{activeTab}</h3>
                </div>

                <div className="flex-1 max-w-64 w-full overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'upload' ? (
                        <UploadPanel />
                    ) : activeTab === 'text' ? (
                        <TextPanel />
                    ) : activeTab === 'shortcuts' ? (
                        <ShortcutsPanel />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale grayscale-100 py-20 gap-4">
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