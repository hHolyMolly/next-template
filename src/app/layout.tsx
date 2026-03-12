import { getLocale } from 'next-intl/server';
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

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteJsonLd(projectConfig.name, urls.website) }}
        />
      </head>
      <body className={roboto.variable}>{children}</body>
    </html>
  );
}

export default RootLayout;
