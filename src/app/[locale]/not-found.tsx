import { getTranslations } from 'next-intl/server';

import { Link } from '@/services/i18n/navigation';
import routes from '@/configs/routes';

export { generateNotFoundMetadata as generateMetadata } from '@/app/[locale]/not-found/metadata';

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-6xl font-bold">404</h2>
      <p className="text-muted-foreground">{t('page_not_found')}</p>
      <Link
        href={routes.Home}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t('go_home')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
