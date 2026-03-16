"use client";

import React from 'react';
import {
    Undo2,
    Redo2,
    Grid,
    Maximize2,
    Keyboard,
    Upload,
    Type,
    Trash2,
    Copy,
    ClipboardPaste,
    Files,
    Save
} from "lucide-react";

const SHORTCUTS = [
    { key: 'Ctrl + Z', label: 'Undo', icon: Undo2, category: 'canvas' },
    { key: 'Ctrl + Y / Shift + Z', label: 'Redo', icon: Redo2, category: 'canvas' },
    { key: 'G', label: 'Toggle Grid', icon: Grid, category: 'canvas' },
    { key: 'F', label: 'Fit to Screen', icon: Maximize2, category: 'canvas' },
    { key: '1', label: 'Upload Panel', icon: Upload, category: 'nav' },
    { key: '2', label: 'Text Panel', icon: Type, category: 'nav' },
    { key: '3', label: 'Shortcuts Panel', icon: Keyboard, category: 'nav' },
    { key: 'Del / Backspace', label: 'Delete Item', icon: Trash2, category: 'edit' },
    { key: 'Ctrl + C', label: 'Copy Item', icon: Copy, category: 'edit' },
    { key: 'Ctrl + V', label: 'Paste Item', icon: ClipboardPaste, category: 'edit' },
    { key: 'Ctrl + D', label: 'Duplicate Item', icon: Files, category: 'edit' },
    { key: 'Ctrl + S', label: 'Save Design', icon: Save, category: 'edit' },
    { key: 'Ctrl + Shift + S', label: 'Save As New', icon: Save, category: 'edit' },
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
                {['canvas', 'nav', 'edit'].map((category) => {
                    const filteredShortcuts = SHORTCUTS.filter(s => s.category === category);
                    if (filteredShortcuts.length === 0) return null;
                    
                    return (
                        <div key={category} className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                                {category === 'canvas' ? 'Canvas Controls' : category === 'nav' ? 'Navigation' : 'Editing'}
                            </h4>
                            <div className="grid gap-2">
                                {filteredShortcuts.map((shortcut) => (
                                    <div
                                        key={shortcut.key}
                                        className="flex items-center cursor-pointer justify-between p-3 rounded-xl border border-black/5 hover:border-black/10 transition-colors group"
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
                    );
                })}
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
