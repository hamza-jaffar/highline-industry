import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomizerState as ConfigState } from '@/app/dashboard/admin/products/[id]/customizer/types';

export interface DesignElement {
  id: string;
  type: 'image' | 'text';
  partName: string; // "Front" or "Back"
  content: string; // Base64 dataURL or text content
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fontFamily?: string;
  fill?: string;
  isLocked?: boolean;
  areaId?: string;
}

export interface CustomizerAppState {
  config: ConfigState | null;
  product: any | null;
  colors: string[];
  selectedColor: string;
  selectedPart: string;
  designs: DesignElement[];
  priceConfig: {
    basePrice: number;
    additions: number;
  };
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
    showGrid: boolean;
  };
  selectedElementId: string | null;
  history: {
    present: DesignElement[];
    past: DesignElement[][];
    future: DesignElement[][];
  };
}

const initialState: CustomizerAppState = {
  config: null,
  product: null,
  colors: [],
  selectedColor: '',
  selectedPart: 'Front',
  designs: [],
  priceConfig: {
    basePrice: 0,
    additions: 0,
  },
  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: false,
  },
  selectedElementId: null,
  history: {
    present: [],
    past: [],
    future: []
  }
};

const updateHistory = (state: CustomizerAppState) => {
  state.history.past.push(state.history.present);
  state.history.present = [...state.designs];
  state.history.future = [];
};

export const customizerSlice = createSlice({
  name: 'customizer',
  initialState,
  reducers: {
    initCustomizer: (state, action: PayloadAction<{ config: ConfigState, product: any }>) => {
      const { config, product } = action.payload;
      state.config = config;
      state.product = product;
      
      const colors = Array.from(new Set(
        product.variants.edges
          .map(({ node }: any) => node.selectedOptions.find((o: any) => o.name.toLowerCase() === "color")?.value)
          .filter(Boolean)
      )) as string[];

      state.colors = colors;
      if (colors.length > 0) {
        state.selectedColor = colors[0];
      }
      
      const parts = Object.keys(config.parts || {});
      if (parts.length > 0) {
        state.selectedPart = parts[0];
      }

      state.priceConfig.basePrice = parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
      state.priceConfig.additions = 0;
      
      // Initialize History
      state.history.present = [];
      state.designs = [];
    },
    setColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },
    setPart: (state, action: PayloadAction<string>) => {
      state.selectedPart = action.payload;
      state.selectedElementId = null;
    },
    addElement: (state, action: PayloadAction<DesignElement>) => {
      state.designs.push(action.payload);
      updateHistory(state);
      state.selectedElementId = action.payload.id;
      customizerSlice.caseReducers.recalculateAdditions(state);
    },
    updateElement: (state, action: PayloadAction<Partial<DesignElement> & { id: string }>) => {
      const index = state.designs.findIndex(el => el.id === action.payload.id);
      if (index !== -1) {
        const hasChangeThatAffectsPrice = action.payload.areaId !== undefined || action.payload.partName !== undefined;
        state.designs[index] = { ...state.designs[index], ...action.payload };
        
        if (hasChangeThatAffectsPrice) {
            customizerSlice.caseReducers.recalculateAdditions(state);
        }
      }
    },
    saveHistoryState: (state) => {
        updateHistory(state);
    },
    removeElement: (state, action: PayloadAction<string>) => {
      state.designs = state.designs.filter(el => el.id !== action.payload);
      updateHistory(state);
      if (state.selectedElementId === action.payload) {
        state.selectedElementId = null;
      }
      customizerSlice.caseReducers.recalculateAdditions(state);
    },
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.push(state.history.present);
        state.history.present = previous;
        state.designs = previous;
        state.selectedElementId = null;
        customizerSlice.caseReducers.recalculateAdditions(state);
      }
    },
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.pop()!;
        state.history.past.push(state.history.present);
        state.history.present = next;
        state.designs = next;
        state.selectedElementId = null;
        customizerSlice.caseReducers.recalculateAdditions(state);
      }
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.canvas.zoom = action.payload;
    },
    setPan: (state, action: PayloadAction<{ x: number, y: number }>) => {
      state.canvas.pan = action.payload;
    },
    toggleGrid: (state) => {
      state.canvas.showGrid = !state.canvas.showGrid;
    },
    recalculateAdditions: (state) => {
       if (!state.config) return;

       let additions = 0;
       state.designs.forEach(el => {
           // Find the area this element belongs to
           const part = state.config?.parts[el.partName];
           const area = part?.areas.find(a => a.id === el.areaId);
           
           if (area) {
               if (el.type === 'image') {
                   additions += area.imagePrice || 0;
               } else if (el.type === 'text') {
                   additions += area.textPrice || 0;
               }
           }
       });

       state.priceConfig.additions = additions;
    },
    resetCustomizer: (state) => {
        state.designs = [];
        state.selectedElementId = null;
        state.canvas.zoom = 1;
        state.canvas.pan = { x: 0, y: 0 };
        state.history.past = [];
        state.history.future = [];
        state.history.present = [];
        state.priceConfig.additions = 0;
    }
  },
});

export const {
  initCustomizer,
  setColor,
  setPart,
  addElement,
  updateElement,
  saveHistoryState,
  removeElement,
  selectElement,
  undo,
  redo,
  setZoom,
  setPan,
  toggleGrid,
  recalculateAdditions,
  resetCustomizer
} = customizerSlice.actions;

export default customizerSlice.reducer;
