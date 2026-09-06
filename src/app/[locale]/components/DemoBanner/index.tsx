'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { featureFlags } from '@/configs/featureFlags';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissBanner, selectBannerDismissed } from '@/store/slices/uiSlice';

/**
 * Demo banner (removed by `pnpm clean:demo`): the living example for the
 * Redux slice (`uiSlice`) and a feature flag working together.
 */
export default function DemoBanner() {
  const t = useTranslations('demo');
  const dispatch = useAppDispatch();
  const dismissed = useAppSelector(selectBannerDismissed);

  if (!featureFlags.isEnabled('demoBanner') || dismissed) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-left text-sm text-sky-200">
      <p>{t('banner_text')}</p>
      <button
        type="button"
        onClick={() => dispatch(dismissBanner())}
        className="shrink-0 rounded-md p-1 text-sky-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{t('banner_dismiss')}</span>
      </button>
    </div>
  );
}
