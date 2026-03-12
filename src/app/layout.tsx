import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { type Metadata, type Viewport } from 'next';

import { roboto } from '@/styles/fonts';
import { getBaseMetadata } from '@/configs/metadata';
import { websiteJsonLd } from '@/lib/jsonLd';
import { urls } from '@/configs/constants/urls';
import { projectConfig } from '@/configs/project';

import '@/styles/normalize.css';
import '@/styles/tailwind.css';
import '@/styles/vars.css';
import '@/styles/index.scss';

type RootLayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata(): Promise<Metadata> {
  return getBaseMetadata();
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang={locale}>
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: websiteJsonLd(projectConfig.name, urls.website) }}
        />
      </head>
      <body className={roboto.variable}>{children}</body>
    </html>
  );
}

export default RootLayout;
