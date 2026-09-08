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
  // Escape every character that could break out of the inline <script> —
  // `<` alone still allows `</script>`-free tricks via `-->` in legacy
  // parsing modes, so escape the full trio.
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
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
