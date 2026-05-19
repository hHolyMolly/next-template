import { ImageResponse } from 'next/og';

import { projectConfig } from '@/configs/project';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * App icon — generated dynamically so rebranding is a one-line change in
 * `projectConfig.name`. Replace with a static `icon.png` in `src/app/` once
 * you have final artwork (static assets skip the ImageResponse roundtrip).
 */
export default function Icon() {
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
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: -1,
        borderRadius: 6,
      }}
    >
      {initial}
    </div>,
    size,
  );
}
