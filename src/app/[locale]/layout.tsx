import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { getBaseMetadata } from '@configs/metadata';

import { routing } from '@services/i18n/routing';

import Header from '@components/layouts/Header';
import Footer from '@components/layouts/Footer';

export async function generateMetadata(): Promise<Metadata> {
  return getBaseMetadata();
}

type LayoutProps<TParams = Record<string, string>> = {
  children: ReactNode;
  params: TParams;
};

async function LocaleLayout({ children, params }: LayoutProps<{ locale: string }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <Header />

      <main className="page">{children}</main>

      <Footer />
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
