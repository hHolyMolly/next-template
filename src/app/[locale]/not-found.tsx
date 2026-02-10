import { useTranslations } from 'next-intl';

import { Link } from '@/services/i18n/navigation';
import routes from '@/configs/routes';

export { generateNotFoundMetadata as generateMetadata } from '@/app/[locale]/not-found/metadata';

function NotFoundPage() {
  const t = useTranslations('translations.errors');

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
