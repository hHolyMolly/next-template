import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { type Metadata } from 'next';

import { roboto } from '@/styles/fonts';
import { getBaseMetadata } from '@/configs/metadata';
import { validateEnv } from '@/configs/env';

import ClientProviders from '@/components/layouts/ClientProviders';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

import '@/styles/normalize.css';
import '@/styles/tailwind.css';
import '@/styles/vars.css';
import '@/styles/index.scss';

validateEnv();

type RootLayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata(): Promise<Metadata> {
  return getBaseMetadata();
}

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={roboto.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            <div className="wrapper">
              <Header />
              <main className="page">{children}</main>
              <Footer />
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
