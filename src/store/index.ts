
import { configureStore } from '@reduxjs/toolkit';
import { marketApi } from './marketApi'; 
import displayReducer from './displaySlice'

export const store = configureStore({
  reducer: {
    [marketApi.reducerPath]: marketApi.reducer,
    display:displayReducer
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(marketApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;