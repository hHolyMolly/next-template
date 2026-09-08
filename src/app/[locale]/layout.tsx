import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider, type Messages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { ClientProviders } from '@/components/layouts/ClientProviders';
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

  // Synchronous — enables static rendering for everything below.
  setRequestLocale(locale);

  // Ship only client-side namespaces — server-only ones (metadata) would
  // otherwise be serialized into every page's RSC payload.
  const messages = await getMessages();
  const clientEntries = clientNamespaces.map((ns) => {
    const value = messages[ns as keyof Messages];
    if (!value && process.env.NODE_ENV === 'development') {
      // Fail loudly in dev: a missing namespace here means every client
      // component silently falls back to raw keys.
      throw new Error(`i18n: client namespace "${ns}" missing from messages for "${locale}"`);
    }
    return [ns, value] as const;
  });
  const clientMessages = Object.fromEntries(clientEntries.filter(([, v]) => v)) as Messages;

  return (
    // `lang`/`dir` live on <html> in the root layout. When adding an RTL
    // locale (ar, he, fa), derive `dir` from the locale there.
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
      <ClientProviders>{children}</ClientProviders>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default LocaleLayout;
