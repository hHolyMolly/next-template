import { useDispatch, useSelector, useStore } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from '@/store';

/**
 * Pre-typed Redux hooks. Always import these — never raw
 * `useDispatch`/`useSelector` — so slice state shape stays inferred.
 *
 * @example
 * const count = useAppSelector((s) => s.counter.value);
 * const dispatch = useAppDispatch();
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
