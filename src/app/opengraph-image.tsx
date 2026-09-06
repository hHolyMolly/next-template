import { ImageResponse } from 'next/og';

import { projectConfig } from '@/configs/project';

export const alt = 'Open Graph preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Default Open Graph image used by the root layout and any page that does
 * not override `preview`.
 *
 * Keep the implementation purely JSX + inline styles — the runtime does
 * not ship CSS. For per-page images, duplicate this file next to the page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
export default function OpengraphImage() {
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
        background: 'linear-gradient(135deg, #0b0b0d 0%, #1a1d24 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 24 }}>{projectConfig.name}</div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: 960,
        }}
      >
        A production-ready Next.js starter
      </div>
    </div>,
    size,
  );
}
