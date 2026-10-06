'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { VisuallyHidden } from '@/components/UI';
import { featureFlags } from '@/configs/featureFlags';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBannerDismissed, setBannerDismissed } from '@/store/slices/uiSlice';

const STORAGE_KEY = 'demo-banner-dismissed';

/**
 * Demo banner (removed by `pnpm clean:demo`): the living example for the
 * Redux slice (`uiSlice`), a feature flag, and `useLocalStorage` working
 * together — dismissal is dispatched to the store AND persisted, then
 * hydrated back into Redux on the next visit.
 */
export function DemoBanner() {
  const t = useTranslations('demo');
  const dispatch = useAppDispatch();
  const dismissed = useAppSelector(selectBannerDismissed);
  const [storedDismissed, setStoredDismissed] = useLocalStorage(STORAGE_KEY, false);

  // Hydrate the store from the persisted flag after mount (not during
  // render — the server knows nothing about localStorage).
  useEffect(() => {
    if (storedDismissed) dispatch(setBannerDismissed(true));
  }, [storedDismissed, dispatch]);

  if (!featureFlags.isEnabled('demoBanner') || dismissed) return null;

  const handleDismiss = () => {
    dispatch(setBannerDismissed(true));
    setStoredDismissed(true);
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-left text-sm text-sky-200">
      <p>{t('banner_text')}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-sky-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <VisuallyHidden>{t('banner_dismiss')}</VisuallyHidden>
      </button>
    </div>
  );
}
