import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';

import { getBaseMetadata } from '@configs/metadata';

import { routing } from '@services/i18n/routing';

import ClientProvidersProps from '@components/layouts/ClientProviders';
import Header from '@components/layouts/Header';
import Footer from '@components/layouts/Footer';

export async function generateMetadata(): Promise<Metadata> {
  return getBaseMetadata();
}

async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <ClientProvidersProps>
        <div className="wrapper">
          <Header />

          <main className="page">{children}</main>

          <Footer />
        </div>
      </ClientProvidersProps>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
