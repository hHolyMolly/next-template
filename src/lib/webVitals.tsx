'use client';

import { useReportWebVitals } from 'next/web-vitals';

import { errorReporting } from '@/lib/errorReporting';
import { logger } from '@/utils/logger';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Endpoint that receives beacon payloads. Set it via
 * `NEXT_PUBLIC_VITALS_ENDPOINT` (e.g. `/api/vitals` or a 3rd-party URL).
 * When unset, metrics are only logged in development.
 */
const VITALS_ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

/**
 * Rating thresholds from web.dev — surface regressions to the error
 * reporter so a real alerting pipeline can act on them.
 */
function reportPoorMetric(name: string, value: number, rating: string) {
  if (rating !== 'poor') return;
  errorReporting.captureMessage(`web-vital:${name} poor (${Math.round(value)})`, 'warning');
}

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

    reportPoorMetric(metric.name, metric.value, metric.rating);

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
