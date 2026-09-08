import { describe, expect, it } from 'vitest';

import { jsonLd, websiteJsonLd } from '@/lib/jsonLd';

describe('jsonLd', () => {
  it('adds the schema.org context', () => {
    const parsed = JSON.parse(jsonLd({ '@type': 'WebSite' })) as Record<string, unknown>;
    expect(parsed['@context']).toBe('https://schema.org');
  });

  it('escapes </script> so the payload cannot break out of the tag', () => {
    const out = jsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
  });

  it('escapes ampersands', () => {
    expect(jsonLd({ name: 'a&b' })).not.toContain('&');
  });

  it('round-trips through JSON.parse unchanged', () => {
    const parsed = JSON.parse(jsonLd({ name: '<b>&</b>' })) as { name: string };
    expect(parsed.name).toBe('<b>&</b>');
  });
});

describe('websiteJsonLd', () => {
  it('builds a WebSite schema', () => {
    const parsed = JSON.parse(websiteJsonLd('My Site', 'https://example.com')) as Record<
      string,
      unknown
    >;
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('My Site');
    expect(parsed.url).toBe('https://example.com');
  });
});
