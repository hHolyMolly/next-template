import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/services/i18n/routing';

import ClientProviders from '@/components/layouts/ClientProviders';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Loading from '@/app/[locale]/loading';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  await setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <ClientProviders>
        <div className="wrapper">
          <Header />
          <main id="main-content" className="page">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
          <Footer />
        </div>
      </ClientProviders>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
