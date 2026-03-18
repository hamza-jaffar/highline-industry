"use client";

import React, { useState } from 'react';
import { CustomizerState, PartDefinition } from './types';
import { Palette, Box, CheckCircle2, Circle, Plus, Trash2, Edit3, Globe, Layers } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/confirm-dialog';

interface CustomizerSidebarProps {
  colors: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedPart: string;
  setSelectedPart: (part: string) => void;
  state: CustomizerState;
  setState: React.Dispatch<React.SetStateAction<CustomizerState>>;
}

const CustomizerSidebar = ({
  colors,
  selectedColor,
  setSelectedColor,
  selectedPart,
  setSelectedPart,
  state,
  setState
}: CustomizerSidebarProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    if (state.parts[newPartName]) {
      toast.error("A part with this name already exists");
      return;
    }

    setState(prev => ({
      ...prev,
      parts: {
        ...prev.parts,
        [newPartName]: {
          id: Math.random().toString(36).substr(2, 9),
          name: newPartName,
          isCommon: false,
          areas: []
        }
      }
    }));
    setSelectedPart(newPartName);
    setNewPartName("");
    setIsAdding(false);
  };

  const handleRenamePart = (oldName: string) => {
    if (!editName.trim() || editName === oldName) {
      setEditingPart(null);
      return;
    }

    setState(prev => {
      const partDef = { ...prev.parts[oldName], name: editName };
      const newParts = { ...prev.parts };
      delete newParts[oldName];
      newParts[editName] = partDef;

      const newCommonImages = { ...prev.commonImages };
      if (newCommonImages[oldName]) {
        newCommonImages[editName] = newCommonImages[oldName];
        delete newCommonImages[oldName];
      }

      const newColorImages = { ...prev.colorImages };
      Object.keys(newColorImages).forEach(color => {
        if (newColorImages[color][oldName]) {
          newColorImages[color][editName] = newColorImages[color][oldName];
          delete newColorImages[color][oldName];
        }
      });

      return {
        ...prev,
        parts: newParts,
        commonImages: newCommonImages,
        colorImages: newColorImages
      };
    });

    if (selectedPart === oldName) {
      setSelectedPart(editName);
    }
    setEditingPart(null);
  };

  const handleDeletePart = (name: string) => {
    setIsDeleting(true);
    setState(prev => {
      const newParts = { ...prev.parts };
      delete newParts[name];

      const newCommonImages = { ...prev.commonImages };
      delete newCommonImages[name];

      const newColorImages = { ...prev.colorImages };
      Object.keys(newColorImages).forEach(color => {
        delete newColorImages[color][name];
      });

      return {
        ...prev,
        parts: newParts,
        commonImages: newCommonImages,
        colorImages: newColorImages
      };
    });

    const remainingParts = Object.keys(state.parts).filter(n => n !== name);
    if (selectedPart === name && remainingParts.length > 0) {
      setSelectedPart(remainingParts[0]);
    }
    setPartToDelete(null);
    setIsDeleting(false);
    toast.success(`Part "${name}" deleted`);
  };

  const toggleCommon = (name: string) => {
    setState(prev => {
      const partDef = prev.parts[name];
      const isBecomingCommon = !partDef.isCommon;

      return {
        ...prev,
        parts: {
          ...prev.parts,
          [name]: { ...partDef, isCommon: isBecomingCommon }
        }
      };
    });
  };

  const allParts = Object.values(state.parts);

  return (
    <aside className='w-full lg:w-96 bg-white border rounded-xl border-black/30 flex flex-col h-full shadow-sm z-30 overflow-hidden'>
      {/* Colors Section */}
      <div className="p-8 border-b border-black/5 bg-[#fafafa]/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Palette className="w-4 h-4 text-black" /> Color Variations
          </h2>
          <span className="text-[10px] font-bold text-gray-300 bg-white px-2 py-1 rounded-full border border-black/5">{colors.length} Variants</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`group relative aspect-square cursor-pointer rounded-lg transition-all duration-300 border overflow-hidden flex flex-col items-center justify-center gap-2 ${selectedColor === color
                ? 'border-black/50 bg-white shadow-xl scale-105 z-10'
                : 'border-transparent bg-white hover:border-black/10'
                }`}
            >
              <div
                className="w-8 h-8 rounded-full shadow-inner border border-black/5 group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: color.toLowerCase() }}
              />
              <span className="text-[9px] font-black uppercase tracking-tighter truncate w-full px-2 text-center">{color}</span>
              {selectedColor === color && <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Section */}
      <div className="p-8 flex-1 flex flex-col min-h-0 bg-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" /> Image Parts
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 bg-black text-white rounded-sm hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
          {isAdding && (
            <div className="p-4 rounded-[2rem] bg-gray-50 border-2 border-dashed border-black/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <input
                autoFocus
                placeholder="Part name (e.g. Sleeve)"
                className="bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-black/5 w-full"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPart()}
              />
              <div className="flex gap-2">
                <button onClick={handleAddPart} className="flex-1 bg-black text-white py-3 rounded-lg cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Add Part</button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-3 bg-white border border-black/5 rounded-lg cursor-pointer text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </div>
          )}

          {allParts.map(part => {
            const isSelected = selectedPart === part.name;
            const isEditing = editingPart === part.name;

            const hasImage = part.isCommon
              ? !!state.commonImages[part.name]
              : !!state.colorImages[selectedColor]?.[part.name];

            const areaCount = part.areas.length;

            return (
              <div
                key={part.id}
                className={`group relative rounded-[2rem] transition-all duration-500 overflow-hidden ${isSelected ? 'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-black/5' : 'hover:bg-gray-50'
                  }`}
              >
                <button
                  onClick={() => setSelectedPart(part.name)}
                  className={`w-full p-6 text-left transition-all flex items-center justify-between ${isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-lg transition-all duration-500 ${isSelected ? 'bg-black text-white rotate-6 scale-110 shadow-xl' : 'bg-gray-100 text-gray-400 group-hover:text-black group-hover:bg-white border border-transparent group-hover:border-black/5 shadow-sm'
                      }`}>
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            className="bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-1 ring-black/20 w-32"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenamePart(part.name)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-[15px] font-bold block ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                            {part.name}
                          </span>
                          {part.isCommon && <Globe className="w-3 h-3 text-blue-500" />}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-black/40' : 'text-gray-300'}`}>
                          {areaCount} Areas {hasImage ? '• Image OK' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasImage && <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-green-500' : 'text-gray-200'}`} />}
                    {!isSelected && !hasImage && <Circle className="w-4 h-4 text-gray-100" />}
                  </div>
                </button>

                {/* Actions Panel */}
                <div className={`flex items-center gap-1 p-2 bg-gray-50/80 backdrop-blur-sm border-t border-black/5 transition-all duration-300 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}>
                  <button
                    onClick={() => { setEditingPart(part.name); setEditName(part.name); }}
                    className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-black"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleCommon(part.name)}
                    className={`px-3 py-1.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${part.isCommon ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-gray-400 border border-black/5 hover:border-black/10 hover:text-black'
                      }`}
                  >
                    <Globe className="w-3 h-3" />
                    {part.isCommon ? "Common" : "Make Common"}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setPartToDelete(part.name)}
                    className="p-2 hover:bg-red-50 rounded-xl transition-all text-gray-300 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!partToDelete}
        title="Delete Part"
        message={`Are you sure you want to delete the part "${partToDelete}"? This will also remove all images and zones associated with this part across all colors.`}
        confirmLabel="Delete Part"
        onConfirm={() => partToDelete && handleDeletePart(partToDelete)}
        onCancel={() => setPartToDelete(null)}
        isLoading={isDeleting}
        variant="danger"
      />
    </aside>
  );
};

export default CustomizerSidebar;