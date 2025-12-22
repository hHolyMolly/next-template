import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';

import { getBaseMetadata } from '@configs/metadata';

import { routing } from '@services/i18n/routing';

import ClientProviders from '@components/layouts/ClientProviders';
import Header from '@components/layouts/Header';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getBaseMetadata();
}

async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <ClientProviders>
        <div className="wrapper">
          <Header />

          <main className="page">{children}</main>
        </div>
      </ClientProviders>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
