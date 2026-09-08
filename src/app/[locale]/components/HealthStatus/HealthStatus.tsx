'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';

import { Card } from '@/app/[locale]/components/Demo/components/Card';
import { cn } from '@/lib/cn';
import { isWaitingFor } from '@/lib/queryState';
import { healthQuery } from '@/services/api/queries';

/**
 * Demo widget (removed by `pnpm clean:demo`): consumes the query that the
 * home page prefetches on the server — on first paint the data comes from
 * the HydrationBoundary, not from a client-side fetch.
 */
export function HealthStatus() {
  const t = useTranslations('demo');
  const tShared = useTranslations('translations.shared');
  // Renders the same on server and client: projectConfig pins timeZone
  // ('UTC'), so useFormatter can't cause a hydration mismatch here.
  const format = useFormatter();
  const query = useQuery(healthQuery);
  const { data, isError, dataUpdatedAt } = query;

  // isWaitingFor, not isPending: a disabled/skipToken query is pending
  // forever — this only shows the placeholder while a fetch is in flight.
  const isPending = isWaitingFor(query);
  const ok = data?.status === 'ok';

  return (
    <Card title={t('health_title')} description={t('health_description')}>
      {/* role=status announces the pending→ok/error transitions politely. */}
      <div role="status" className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'h-3 w-3 rounded-full',
            isPending && 'animate-pulse bg-slate-500',
            ok && 'bg-green-500',
            isError && 'bg-red-500',
          )}
        />
        <span className="font-medium text-slate-200">
          {isPending ? tShared('loading') : ok ? t('health_ok') : t('health_error')}
        </span>
      </div>

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
    </Card>
  );
}
