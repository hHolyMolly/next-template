import { getTranslations } from 'next-intl/server';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');
  const meta = await getTranslations('metadata.not_found');

  return (
    <div className="wrapper">
      <title>{meta('title')}</title>
      <meta name="robots" content="noindex, nofollow" />
      <Header />
      <main id="main-content" className="page">
        {t('not_found_title')}
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
