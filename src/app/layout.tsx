import { getLocale } from 'next-intl/server';

import '@styles/normalize.css';
import '@styles/vars.css';
import '@styles/index.scss';
import '@styles/tailwind.css';
import '@styles/fonts.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
