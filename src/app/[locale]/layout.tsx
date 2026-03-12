import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/services/i18n/routing';

import ClientProviders from '@/components/layouts/ClientProviders';

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
      <ClientProviders>{children}</ClientProviders>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
