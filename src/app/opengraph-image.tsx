import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

import { projectConfig } from '@/configs/project';

export const alt = 'Open Graph preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Default Open Graph image used by the root layout and any page that does
 * not override `preview`. Copy comes from the default locale's
 * `metadata.global` namespace (this route has no locale segment), colors
 * from `projectConfig.theme`.
 *
 * Keep the implementation purely JSX + inline styles — the runtime does
 * not ship CSS. For per-page images, duplicate this file next to the page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
export default async function OpengraphImage() {
  const t = await getTranslations({
    locale: projectConfig.i18n.defaultLocale,
    namespace: 'metadata.global',
  });

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '80px',
        background: `linear-gradient(135deg, ${projectConfig.theme.brand} 0%, #1a1d24 100%)`,
        color: projectConfig.theme.onBrand,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 24 }}>{projectConfig.name}</div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          maxWidth: 1000,
        }}
      >
        {t('title')}
      </div>
      <div style={{ fontSize: 28, opacity: 0.8, marginTop: 24, maxWidth: 1000, lineHeight: 1.4 }}>
        {t('description')}
      </div>
    </div>,
    size,
  );
}
