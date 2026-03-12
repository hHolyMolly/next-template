import dynamic from 'next/dynamic';
import { type ComponentType } from 'react';

import { LoadingIcon } from '@/components/icons';

type DynamicOptions = {
  /** Show loading indicator (default: true) */
  loading?: boolean;
  /** Enable SSR (default: false for client components) */
  ssr?: boolean;
};

/**
 * Helper for dynamic imports with standardized loading states.
 * Use for heavy client-only components to reduce initial bundle size.
 *
 * @example
 * const HeavyChart = lazyLoad(() => import('@/components/Chart'));
 * const MapView = lazyLoad(() => import('@/components/Map'), { ssr: false });
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicOptions = {},
): ComponentType<P> {
  const { loading = true, ssr = false } = options;

  return dynamic(importFn, {
    ssr,
    ...(loading
      ? {
          loading: () => (
            <div className="flex items-center justify-center p-4">
              <LoadingIcon size={24} />
            </div>
          ),
        }
      : {}),
  });
}
