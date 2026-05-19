import { getTranslations } from 'next-intl/server';

import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';

type RoutesLayoutProps = {
  children: React.ReactNode;
};

async function RoutesLayout({ children }: RoutesLayoutProps) {
  const t = await getTranslations('translations.shared');

  return (
    <div className="wrapper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
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
