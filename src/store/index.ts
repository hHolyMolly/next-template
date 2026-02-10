import { useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import counterSlice from '@/store/slices/counterSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      counter: counterSlice,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
