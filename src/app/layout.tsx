import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { type Metadata, type Viewport } from 'next';

import { roboto } from '@/styles/fonts';
import { getBaseMetadata } from '@/configs/metadata';
import { ThemeScript } from '@/components/layouts/ThemeProvider';
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
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeScript {...(nonce ? { nonce } : {})} />
        <script
          type="application/ld+json"
          {...(nonce ? { nonce } : {})}
          dangerouslySetInnerHTML={{ __html: websiteJsonLd(projectConfig.name, urls.website) }}
        />
      </head>
      <body className={roboto.variable}>
        {/* Skip-to-content link for keyboard/screen reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
