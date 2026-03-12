'use client';

import { useReportWebVitals } from 'next/web-vitals';

import { logger } from '@/utils/logger';

/**
 * Reports Core Web Vitals metrics.
 * Add this component to the root layout to start collecting metrics.
 *
 * Integrate with your analytics service by replacing the logger calls:
 * - Google Analytics: `gtag('event', metric.name, { value: metric.value })`
 * - Custom endpoint: `navigator.sendBeacon('/api/vitals', JSON.stringify(metric))`
 * - Vercel: Install `@vercel/speed-insights` (automatic)
 *
 * @see https://web.dev/vitals/
 *
 * @example
 * // In [locale]/layout.tsx:
 * import { WebVitals } from '@/lib/webVitals';
 * <WebVitals />
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    logger.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
    });

    // Send to analytics in production (uncomment and customize):
    // const body = JSON.stringify({
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   id: metric.id,
    //   page: window.location.pathname,
    // });
    // navigator.sendBeacon?.('/api/vitals', body);
  });

  return null;
}
