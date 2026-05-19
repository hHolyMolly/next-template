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
