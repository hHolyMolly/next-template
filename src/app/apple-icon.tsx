import { ImageResponse } from 'next/og';

import { projectConfig } from '@/configs/project';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Apple touch icon (home-screen on iOS/iPadOS). The standard favicon is the
 * static `src/app/favicon.ico`. Replace with a static PNG once branding is
 * final; colors come from `projectConfig.theme`.
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
        background: projectConfig.theme.brand,
        color: projectConfig.theme.onBrand,
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
