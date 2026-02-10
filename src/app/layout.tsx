import { getLocale } from 'next-intl/server';
import { type Metadata } from 'next';

import { roboto } from '@/styles/fonts';
import { getBaseMetadata } from '@/configs/metadata';
import { validateEnv } from '@/configs/env';

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

  return (
    <html lang={locale}>
      <body className={roboto.className}>{children}</body>
    </html>
  );
}

export default RootLayout;
