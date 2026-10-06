'use client';

import { useReportWebVitals } from 'next/web-vitals';

import { logger } from '@/utils/logger';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Endpoint that receives beacon payloads. Set it via
 * `NEXT_PUBLIC_VITALS_ENDPOINT` — an absolute http(s) URL (env validation
 * rejects relative paths), e.g. your own `/api/vitals` Route Handler as
 * `https://example.com/api/vitals` or a 3rd-party collector. When unset,
 * metrics are only logged in development. Each payload carries the web.dev
 * `rating` ('good' | 'needs-improvement' | 'poor') — alert on 'poor' in the
 * collector, not in the browser.
 */
const VITALS_ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

/**
 * Reports Core Web Vitals metrics.
 * Mount once in the [locale]/layout tree (already wired in ClientProviders).
 *
 * @see https://web.dev/vitals/
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const displayValue = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);

    if (isDev) {
      logger.log(`[Web Vitals] ${metric.name}:`, {
        value: displayValue,
        rating: metric.rating,
        id: metric.id,
      });
    }

    if (!VITALS_ENDPOINT) return;

    // Blob carries the Content-Type — a bare string beacon arrives as
    // text/plain and most collectors reject it.
    const body = new Blob(
      [
        JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          delta: metric.delta,
          navigationType: metric.navigationType,
          page: window.location.pathname,
        }),
      ],
      { type: 'application/json' },
    );

    // `sendBeacon` is the recommended transport — it survives unload. It
    // returns false when the browser refuses (queue full) — fall back to
    // `fetch({ keepalive: true })` so the metric isn't silently dropped.
    const queued = navigator.sendBeacon?.(VITALS_ENDPOINT, body) ?? false;
    if (!queued) {
      void fetch(VITALS_ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {
        // Swallow — losing a metric must never break the page.
      });
    }
  });

  return null;
}
