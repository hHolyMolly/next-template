import { getBaseMetadata, previewImage } from '@/configs/metadata/getBaseMetadata';
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
export async function createMetadata(overrides?: MetadataOverrides): Promise<Metadata> {
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

  // A page WITHOUT its own title must show the bare site title: re-emitting
  // the base `{ default, template }` object here would make Next apply the
  // root template to `default` ("Site | Site"). `absolute` opts out.
  const baseTitle = base.title;
  const defaultTitle =
    typeof baseTitle === 'object' && baseTitle !== null && 'default' in baseTitle
      ? baseTitle.default
      : baseTitle;
  const titleOverride =
    rest.title === undefined && typeof defaultTitle === 'string'
      ? { title: { absolute: defaultTitle } }
      : {};

  return {
    ...base,
    ...titleOverride,
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
