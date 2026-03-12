import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

import { createMetadata } from '@/configs/metadata';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.not_found');

  return createMetadata({
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  });
}

/**
 * Root-level 404 page — outside [locale] layout.
 *
 * Catches requests that don't match any locale prefix (e.g., `/template.html`).
 * This page renders its own Header/Footer because it's outside [locale]/layout.tsx.
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
