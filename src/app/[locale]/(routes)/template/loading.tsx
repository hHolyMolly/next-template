import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/UI';

/**
 * Route-level loading UI — streamed while the segment resolves.
 * Kept at route level (never at locale level): a locale-level Suspense
 * boundary would stream a 200 shell before the [...rest] catch-all can
 * throw notFound(), breaking the 404 status code.
 */
function Loading() {
  const t = useTranslations('translations.shared');

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t('loading')}</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
    </div>
  );
}

export default Loading;
