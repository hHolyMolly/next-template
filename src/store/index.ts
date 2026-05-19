import { configureStore } from '@reduxjs/toolkit';

export function makeStore() {
  return configureStore({
    reducer: {
      // Add your slices here, e.g.: `user: userSlice`.
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// NOTE: Typed hooks (`useAppDispatch`, `useAppSelector`, `useAppStore`) live in
// `@/store/hooks` to avoid a circular import when slices themselves need to
// reference `RootState`. Always import them from `@/store/hooks` — never from
// this barrel. Enforced by the convention documented in AGENTS.md.
