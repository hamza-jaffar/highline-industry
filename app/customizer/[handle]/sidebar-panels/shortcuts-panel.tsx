"use client";

import React from 'react';
import { 
    Undo2, 
    Redo2, 
    Grid, 
    Maximize2, 
    Keyboard 
} from "lucide-react";

const SHORTCUTS = [
    { key: 'Ctrl + Z', label: 'Undo', icon: Undo2 },
    { key: 'Ctrl + Y', label: 'Redo', icon: Redo2 },
    { key: 'G', label: 'Toggle Grid', icon: Grid },
    { key: 'F', label: 'Fit to Screen', icon: Maximize2 },
    // Add more as they are implemented
];

const ShortcutsPanel = () => {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Keyboard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Pro Tip</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Use keyboard shortcuts to speed up your design process.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Canvas Controls</h4>
                <div className="grid gap-2">
                    {SHORTCUTS.map((shortcut) => (
                        <div 
                            key={shortcut.key}
                            className="flex items-center justify-between p-3 rounded-xl border border-black/5 hover:border-black/10 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                    <shortcut.icon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 group-hover:text-black transition-colors">
                                    {shortcut.label}
                                </span>
                            </div>
                            <kbd className="px-2 py-1 bg-gray-100 border border-black/10 rounded text-[10px] font-bold text-gray-500 shadow-sm">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-black/5">
                <p className="text-[10px] text-gray-400 font-medium text-center">
                    More shortcuts coming soon...
                </p>
            </div>
        </div>
    );
};

export default ShortcutsPanel;
