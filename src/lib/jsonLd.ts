/**
 * Generates JSON-LD structured data for SEO.
 *
 * @example
 * // In a page component:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: jsonLd({
 *     '@type': 'WebSite',
 *     name: 'My Site',
 *     url: 'https://example.com',
 *   }) }}
 * />
 */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  }).replace(/</g, '\\u003c');
}

/**
 * Generates WebSite JSON-LD schema.
 */
export function websiteJsonLd(name: string, url: string): string {
  return jsonLd({
    '@type': 'WebSite',
    name,
    url,
  });
}

/**
 * Generates Organization JSON-LD schema.
 */
export function organizationJsonLd(options: {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}): string {
  return jsonLd({
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    ...(options.logo && { logo: options.logo }),
    ...(options.sameAs && { sameAs: options.sameAs }),
  });
}

/**
 * Generates BreadcrumbList JSON-LD schema for SEO navigation breadcrumbs.
 *
 * @example
 * const breadcrumbs = breadcrumbJsonLd([
 *   { name: 'Home', url: 'https://example.com' },
 *   { name: 'Products', url: 'https://example.com/products' },
 *   { name: 'Widget', url: 'https://example.com/products/widget' },
 * ]);
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): string {
  return jsonLd({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * Generates Article JSON-LD schema for blog posts / articles.
 */
export function articleJsonLd(options: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; url?: string };
}): string {
  return jsonLd({
    '@type': 'Article',
    headline: options.headline,
    description: options.description,
    url: options.url,
    ...(options.image && { image: options.image }),
    datePublished: options.datePublished,
    ...(options.dateModified && { dateModified: options.dateModified }),
    author: {
      '@type': 'Person',
      name: options.author.name,
      ...(options.author.url && { url: options.author.url }),
    },
  });
}
