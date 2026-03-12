import { getTranslations } from 'next-intl/server';

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');

  return <>{t('not_found_title')}</>;
}

export default NotFoundPage;
