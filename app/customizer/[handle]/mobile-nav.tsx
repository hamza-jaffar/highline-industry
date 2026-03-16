"use client";

import {
    Plus,
    Layers,
    Settings
} from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setTab } from '@/lib/store/customizerSlice';

const MobileNav = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(state => state.customizer.activeTab);
    const selectedElementId = useAppSelector(state => state.customizer.selectedElementId);

    return (
        <nav className="h-16 bg-white border-t border-black/5 flex items-center justify-around px-2 pb-safe shrink-0 z-50">
            <button
                onClick={() => dispatch(setTab('upload'))}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'upload' ? 'text-black' : 'text-gray-400'}`}
            >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
            </button>

            <button
                onClick={() => {
                    dispatch(setTab('layers'));
                }}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'layers' ? 'text-black' : 'text-gray-400'}`}
            >
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Layers</span>
            </button>

            <button
                disabled={!selectedElementId}
                onClick={() => {
                    // This could trigger a specific attributes panel
                }}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${selectedElementId ? 'text-black' : 'text-gray-200'}`}
            >
                <Settings className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
            </button>
        </nav>
    );
};

export default MobileNav;
