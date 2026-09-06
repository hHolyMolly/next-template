import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Client-global UI state. This slice is the canonical Redux example:
 * copy it when adding real slices (auth, cart, sidebar, …) and register
 * them in `src/store/index.ts`.
 *
 * The demo consumer lives in `src/app/[locale]/components/DemoBanner`.
 */

type UiState = {
  bannerDismissed: boolean;
};

const initialState: UiState = {
  bannerDismissed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    dismissBanner(state) {
      state.bannerDismissed = true;
    },
    setBannerDismissed(state, action: PayloadAction<boolean>) {
      state.bannerDismissed = action.payload;
    },
  },
});

export const { dismissBanner, setBannerDismissed } = uiSlice.actions;

/** Selector kept next to the slice — the only place that knows the shape. */
export const selectBannerDismissed = (state: { ui: UiState }) => state.ui.bannerDismissed;

export default uiSlice.reducer;
