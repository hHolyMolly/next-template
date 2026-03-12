import { getTranslations } from 'next-intl/server';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

async function NotFoundPage() {
  const t = await getTranslations('translations.errors');

  return (
    <div className="wrapper">
      <Header />
      <main id="main-content" className="page">
        {t('not_found_title')}
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
