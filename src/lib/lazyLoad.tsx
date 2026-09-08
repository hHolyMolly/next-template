'use client';

import dynamic from 'next/dynamic';

import { LoadingIcon } from '@/components/icons';

import type { ComponentType } from 'react';

type DynamicOptions = {
  /** Show loading indicator (default: true) */
  loading?: boolean;
  /** Enable SSR (default: false for client components) */
  ssr?: boolean;
  /** Accessible name for the loading state — pass a translated string. */
  label?: string;
};

/**
 * Helper for dynamic imports with standardized loading states.
 * Use for heavy client-only components to reduce initial bundle size.
 *
 * Client-only on purpose: `ssr: false` is allowed exclusively inside Client
 * Components — calling this from a Server Component is a build error, which
 * is exactly the guardrail we want.
 *
 * @example
 * const HeavyChart = lazyLoad(() => import('@/components/Chart'));
 * const MapView = lazyLoad(() => import('@/components/Map'), { ssr: false });
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicOptions = {},
): ComponentType<P> {
  const { loading = true, ssr = false, label } = options;

  return dynamic(importFn, {
    ssr,
    ...(loading
      ? {
          loading: () => (
            <div className="flex items-center justify-center p-4">
              <LoadingIcon size={24} {...(label ? { label } : {})} />
            </div>
          ),
        }
      : {}),
  });
}
