import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { urls } from '@/configs/constants/urls';
import { getBaseMetadata } from '@/configs/metadata';
import { projectConfig } from '@/configs/project';
import { websiteJsonLd } from '@/lib/jsonLd';
import { appFont } from '@/styles/fonts';

import type { Metadata, Viewport } from 'next';

import '@/styles/normalize.css';
import '@/styles/vars.css';
import '@/styles/tailwind.css';
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
  // Single light theme by design (no dark mode); shared with manifest.ts.
  themeColor: projectConfig.theme.background,
};

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    // The next/font variable MUST sit on <html>: Tailwind resolves
    // `--font-sans: var(--font-app)` on :root, and a custom property is
    // substituted where it is DEFINED — on <body> the reference is invalid
    // at :root and the whole stack falls back to the system font.
    // No preconnect to fonts.gstatic.com: next/font self-hosts at build time.
    <html lang={locale} className={appFont.variable}>
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: websiteJsonLd(projectConfig.name, urls.website) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
