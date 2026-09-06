'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { healthQuery } from '@/services/api/queries';

/**
 * Demo widget (removed by `pnpm clean:demo`): consumes the query that the
 * home page prefetches on the server — on first paint the data comes from
 * the HydrationBoundary, not from a client-side fetch.
 */
export default function HealthStatus() {
  const t = useTranslations('demo');
  const tShared = useTranslations('translations.shared');
  const format = useFormatter();
  const { data, isPending, isError, dataUpdatedAt } = useQuery(healthQuery);

  const ok = data?.status === 'ok';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <h2 className="mb-1 text-lg font-semibold text-slate-100">{t('health_title')}</h2>
      <p className="mb-5 text-sm text-slate-400">{t('health_description')}</p>

      <div className="flex items-center gap-3">
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
    </div>
  );
}
