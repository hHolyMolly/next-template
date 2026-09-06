import { Roboto } from 'next/font/google';

/**
 * Application font.
 *
 * `next/font` requires the loader call to live at module scope with a literal
 * options object — so swapping fonts means editing this file. Downstream code
 * references only the generic `appFont` export and the CSS variable
 * `--font-app` (declared below; mapped to Tailwind's `--font-sans` token in
 * tailwind.css `@theme inline`), so no other file needs to change when you
 * pick a different family.
 *
 * Keep the weight set small — each declared weight adds a network roundtrip
 * to the critical CSS. Add more weights only when a design actually needs
 * them. `display: 'optional'` avoids FOIT and the layout shift that
 * `swap` produces on slow connections (best LCP behavior).
 */
export const appFont = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-app',
  display: 'optional',
  adjustFontFallback: true,
});
