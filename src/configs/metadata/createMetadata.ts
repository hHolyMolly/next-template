import getBaseMetadata from '@/configs/metadata/getBaseMetadata';

import type { Metadata } from 'next';

type MetadataOverrides = Partial<Metadata> & {
  /**
   * Shorthand for OG & Twitter preview image.
   * Accepts a full URL or a path from `public/`.
   */
  preview?: string;
  /**
   * Route-relative path (e.g. `/template`) used to build canonical +
   * hreflang URLs. Defaults to `/`.
   */
  path?: string;
};

/**
 * Create page metadata by merging overrides with the base metadata.
 *
 * @example
 * return createMetadata({
 *   title: 'About Us',
 *   description: 'Learn more about our team',
 *   preview: '/assets/img/previews/about.webp',
 *   path: '/about',
 * });
 */
async function createMetadata(overrides?: MetadataOverrides): Promise<Metadata> {
  const { preview, path, ...rest } = overrides ?? {};
  const base = await getBaseMetadata(path ?? '/');

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
