import { type Metadata } from 'next';

import getBaseMetadata from '@/configs/metadata/getBaseMetadata';

type MetadataOverrides = Partial<Metadata> & {
  /**
   * Shorthand for OG & Twitter preview image.
   * Accepts a full URL or a path from `public/`.
   *
   * @example
   * // Path from public/ (resolved via previewImage helper):
   * createMetadata({ preview: '/assets/img/previews/home.webp' })
   *
   * // Full URL:
   * createMetadata({ preview: 'https://cdn.example.com/og.png' })
   */
  preview?: string;
};

/**
 * Create page metadata by merging overrides with the base metadata.
 *
 * Use `preview` shorthand to set OG & Twitter image for the page.
 *
 * @example
 * // Page with custom preview:
 * return createMetadata({
 *   title: 'About Us',
 *   description: 'Learn more about our team',
 *   preview: '/assets/img/previews/about.webp',
 * });
 *
 * // Page using global preview (default):
 * return createMetadata({ title: 'Contact' });
 */
async function createMetadata(overrides?: MetadataOverrides): Promise<Metadata> {
  const base = await getBaseMetadata();

  const { preview, ...rest } = overrides ?? {};

  let imageOverrides: { images: string[] } | undefined;
  if (preview) {
    const { previewImage } = await import('@/configs/metadata/getBaseMetadata');
    const imageUrl = preview.startsWith('http') ? preview : previewImage(preview);
    imageOverrides = { images: [imageUrl] };
  }

  return {
    ...base,
    ...rest,

    openGraph: {
      ...base.openGraph,
      ...rest.openGraph,
      ...imageOverrides,
    },

    twitter: {
      ...base.twitter,
      ...rest.twitter,
      ...imageOverrides,
    },
  };
}

export default createMetadata;
