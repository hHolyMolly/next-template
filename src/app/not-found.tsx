import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { createMetadata } from '@/configs/metadata';
import { Link } from '@/services/i18n/navigation';
import routes from '@/configs/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.not_found');

  return createMetadata({
    title: t('title'),
    description: t('description'),
  });
}

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-6xl font-bold">404</h2>
      <p className="text-gray-500">{t('page_not_found')}</p>
      <Link
        href={routes.Home}
        className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-80 transition-opacity"
      >
        {t('go_home')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
