'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { Card } from '@/app/[locale]/components/Demo/components/Card';
import { ErrorBoundary } from '@/components/layouts/ErrorBoundary';
import { cn } from '@/lib/cn';
import { healthQuery } from '@/services/api/queries';

type StatusLineProps = {
  kind: 'pending' | 'ok' | 'error';
  label: string;
};

function StatusLine({ kind, label }: StatusLineProps) {
  return (
    // role=status announces the pending→ok/error transitions politely.
    <div role="status" className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          'h-3 w-3 rounded-full',
          kind === 'pending' && 'animate-pulse bg-slate-500',
          kind === 'ok' && 'bg-green-500',
          kind === 'error' && 'bg-red-500',
        )}
      />
      <span className="font-medium text-slate-200">{label}</span>
    </div>
  );
}

/**
 * Consumes the query the home page prefetched on the server. `useSuspenseQuery`
 * (not `useQuery`) on purpose: the query is dehydrated while still PENDING and
 * streams its promise to the client. With `useQuery` the server would render
 * the loading state while the client could already hold the resolved value
 * at hydration time → text mismatch (React #418). Suspense makes both sides
 * wait for the same promise.
 */
function HealthStatusLive() {
  const t = useTranslations('demo');
  // Renders the same on server and client: projectConfig pins timeZone
  // ('UTC'), so useFormatter can't cause a hydration mismatch here.
  const format = useFormatter();
  const { data, dataUpdatedAt } = useSuspenseQuery(healthQuery);
  const ok = data.status === 'ok';

  return (
    <>
      <StatusLine kind={ok ? 'ok' : 'error'} label={ok ? t('health_ok') : t('health_error')} />
      {ok && (
        <p className="mt-3 text-xs text-slate-500">
          {t('health_checked', {
            time: format.dateTime(new Date(dataUpdatedAt), {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          })}
        </p>
      )}
    </>
  );
}

/**
 * Demo widget (removed by `pnpm clean:demo`): the living example for
 * TanStack Query streaming SSR — server prefetch → HydrationBoundary →
 * `useSuspenseQuery` — plus `ErrorBoundary` as the inline error state
 * (a failed first load must not take the whole page down).
 */
export function HealthStatus() {
  const t = useTranslations('demo');
  const tShared = useTranslations('translations.shared');

  return (
    <Card title={t('health_title')} description={t('health_description')}>
      <ErrorBoundary fallback={<StatusLine kind="error" label={t('health_error')} />}>
        <Suspense fallback={<StatusLine kind="pending" label={tShared('loading')} />}>
          <HealthStatusLive />
        </Suspense>
      </ErrorBoundary>
    </Card>
  );
}
