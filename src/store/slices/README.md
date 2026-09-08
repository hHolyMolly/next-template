# Redux Toolkit slices

`uiSlice.ts` is the canonical example — copy it when adding real slices
(auth, cart, sidebar, …). The conventions it demonstrates:

- **File per slice**, named `<name>Slice.ts` (`authSlice.ts`).
- **Selectors are colocated** with the slice — it's the only place that
  knows the state shape:

  ```ts
  export const selectBannerDismissed = (state: { ui: UiState }) => state.ui.bannerDismissed;
  ```

- **Register the reducer** in `src/store/index.ts`:

  ```ts
  import uiReducer from '@/store/slices/uiSlice';
  // ...
  reducer: { ui: uiReducer },
  ```

- **Per-request store**: `makeStore()` creates a fresh store for every
  request (see `ClientProviders`) — never keep a module-level store
  instance, it would leak state between SSR requests.

Typed hooks (`useAppDispatch`, `useAppSelector`) live in `@/store/hooks` —
never import them from `@/store`.

The living consumer of `uiSlice` is
`src/app/[locale]/components/DemoBanner` (removed by `pnpm clean:demo`).
