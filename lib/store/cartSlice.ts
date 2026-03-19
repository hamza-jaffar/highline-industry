import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartState {
  isOpen: boolean;
  data: any | null; // Shopify Cart object
}

const initialState: CartState = {
  isOpen: false,
  data: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
  },
});

export const { setCartOpen, toggleCart, setCartData } = cartSlice.actions;

export default cartSlice.reducer;
