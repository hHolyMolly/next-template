import { getTranslations } from 'next-intl/server';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

/**
 * Root-level 404 page — outside [locale] layout.
 *
 * Catches requests that don't match any locale prefix (e.g., `/template.html`).
 * Uses the same translations and layout as the locale-level 404.
 */
async function RootNotFoundPage() {
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

export default RootNotFoundPage;
