import getBaseMetadata, { previewImage } from '@/configs/metadata/getBaseMetadata';
import { isAbsoluteUrl } from '@/lib/origin';

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
 * A top-level `title`/`description` flows into `openGraph`/`twitter` too —
 * without that, every share card would show the site-wide title. Explicit
 * `openGraph`/`twitter` overrides still win.
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
    const imageUrl = isAbsoluteUrl(preview) ? preview : previewImage(preview);
    imageOverrides = { images: [imageUrl] };
  }

  const socialOverrides = {
    ...(rest.title != null ? { title: rest.title } : {}),
    ...(rest.description != null ? { description: rest.description } : {}),
  };

  return {
    ...base,
    ...rest,

    // Merge instead of replace — a page passing `alternates: { canonical }`
    // must not silently drop the hreflang map built by the base.
    alternates: {
      ...base.alternates,
      ...rest.alternates,
    },

    openGraph: {
      ...base.openGraph,
      ...socialOverrides,
      ...rest.openGraph,
      ...imageOverrides,
    },

    twitter: {
      ...base.twitter,
      ...socialOverrides,
      ...rest.twitter,
      ...imageOverrides,
    },
  };
}

export default createMetadata;
