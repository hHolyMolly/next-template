'use client';

import { useTranslations } from 'next-intl';

function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('translations.errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-semibold">{t('something_went_wrong')}</h2>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-80 transition-opacity"
      >
        {t('try_again')}
      </button>
    </div>
  );
}

export default ErrorPage;
