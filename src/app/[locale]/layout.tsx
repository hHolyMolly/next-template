import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider, type Messages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import ClientProviders from '@/components/layouts/ClientProviders';
import { clientNamespaces } from '@/services/i18n/constants';
import { routing } from '@/services/i18n/routing';

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

  // Ship only client-side namespaces — server-only ones (metadata) would
  // otherwise be serialized into every page's RSC payload.
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(
    clientNamespaces.map((ns) => [ns, messages[ns as keyof Messages]]).filter(([, v]) => v),
  ) as Messages;

  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
      <ClientProviders>{children}</ClientProviders>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
