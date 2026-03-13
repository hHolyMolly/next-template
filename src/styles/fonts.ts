import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '300', '400', '500', '700', '800', '900'],
  variable: '--font-roboto',
  display: 'swap',
  adjustFontFallback: true,
});
