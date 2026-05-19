import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { urls } from '@/configs/constants/urls';
import { getBaseMetadata } from '@/configs/metadata';
import { projectConfig } from '@/configs/project';
import { websiteJsonLd } from '@/lib/jsonLd';
import { appFont } from '@/styles/fonts';

import type { Metadata, Viewport } from 'next';

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
};

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang={locale}>
      <head>
        {/* Speed up `next/font/google` loads by establishing the TLS handshake
            to fonts.gstatic.com as early as possible. `dns-prefetch` falls back
            for browsers that ignore preconnect (mostly noop on modern ones). */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script
          nonce={nonce}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: websiteJsonLd(projectConfig.name, urls.website) }}
        />
      </head>
      <body className={appFont.variable}>{children}</body>
    </html>
  );
}

export default RootLayout;
