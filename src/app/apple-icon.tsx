import { ImageResponse } from 'next/og';

import { projectConfig } from '@/configs/project';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Apple touch icon (home-screen on iOS/iPadOS). See `icon.tsx` for the
 * standard favicon. Replace with a static PNG once branding is final.
 */
export default function AppleIcon() {
  const initial = projectConfig.name?.[0]?.toUpperCase() ?? 'A';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0b0d',
        color: '#ffffff',
        fontSize: 110,
        fontWeight: 700,
        letterSpacing: -4,
        borderRadius: 32,
      }}
    >
      {initial}
    </div>,
    size,
  );
}
