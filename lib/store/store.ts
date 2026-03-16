import { configureStore } from '@reduxjs/toolkit';
import customizerReducer from '@/lib/store/customizerSlice';

export const store = configureStore({
  reducer: {
    customizer: customizerReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
