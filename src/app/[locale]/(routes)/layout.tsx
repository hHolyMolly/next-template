import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Footer } from '@/components/layouts/Footer';
import { Header } from '@/components/layouts/Header';

type RoutesLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

async function RoutesLayout({ children, params }: RoutesLayoutProps) {
  // Every layout/page in the tree must call this, or the whole subtree
  // drops out of static rendering (next-intl requirement).
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('translations.shared');

  return (
    <div className="wrapper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
      >
        {t('skip_to_content')}
      </a>
      <Header />
      <main id="main-content" className="page">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default RoutesLayout;
