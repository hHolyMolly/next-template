'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/UI';

type ErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shared UI for `error.tsx` boundaries ([locale] and route groups).
 *
 * Requires `NextIntlClientProvider` above it — `app/global-error.tsx`
 * renders when the root layout itself failed, so it keeps its own
 * hardcoded, inline-styled markup instead of using this component.
 */
export function ErrorState({ error, reset }: ErrorStateProps) {
  const t = useTranslations('translations.errors');

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold">{t('something_went_wrong')}</h2>

      {process.env.NODE_ENV === 'development' && error.message ? (
        <pre className="max-w-[600px] overflow-auto rounded-lg bg-destructive/10 px-4 py-3 text-sm break-words whitespace-pre-wrap text-destructive">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
      ) : null}

      <Button onClick={reset}>{t('try_again')}</Button>
    </div>
  );
}
