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

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });

    // `sendBeacon` is the recommended transport — it survives unload.
    // Fall back to `fetch({ keepalive: true })` when unavailable.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(VITALS_ENDPOINT, body);
    } else if (typeof fetch !== 'undefined') {
      void fetch(VITALS_ENDPOINT, {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Swallow — losing a metric must never break the page.
      });
    }
  });

  return null;
}
