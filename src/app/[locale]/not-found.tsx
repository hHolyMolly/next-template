import { getTranslations } from 'next-intl/server';

import { Footer } from '@/components/layouts/Footer';
import { Header } from '@/components/layouts/Header';
import { Button } from '@/components/UI';
import { routes } from '@/configs/routes';
import { Link } from '@/services/i18n/navigation';

/**
 * Styled 404 for the locale tree. It renders OUTSIDE the `(routes)` group
 * layout (the catch-all page throws before that layout applies), so the
 * chrome — skip link, Header, <main> landmark, Footer — is composed here.
 */
async function NotFoundPage() {
  const [t, tShared] = await Promise.all([
    getTranslations('translations.errors'),
    getTranslations('translations.shared'),
  ]);

  return (
    <div className="wrapper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
      >
        {tShared('skip_to_content')}
      </a>
      <Header />
      <main id="main-content" className="page">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight">404</h1>
          <p className="max-w-md text-muted-foreground">{t('page_not_found')}</p>
          <Button asChild>
            <Link href={routes.home()}>{t('go_home')}</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
