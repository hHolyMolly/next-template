import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/UI';
import routes from '@/configs/routes';
import { Link } from '@/services/i18n/navigation';

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="max-w-md text-muted-foreground">{t('page_not_found')}</p>
      <Button asChild>
        <Link href={routes.home()}>{t('go_home')}</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
