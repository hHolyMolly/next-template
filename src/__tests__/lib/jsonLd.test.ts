import { jsonLd, websiteJsonLd, organizationJsonLd } from '@/lib/jsonLd';

describe('jsonLd', () => {
  it('should include @context schema.org', () => {
    const result = jsonLd({ '@type': 'WebSite', name: 'Test' });
    const parsed = JSON.parse(result);

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('Test');
  });

  it('should escape < to prevent XSS via </script>', () => {
    const result = jsonLd({ name: '</script><script>alert(1)</script>' });

    expect(result).not.toContain('</script>');
    expect(result).toContain('\\u003c');
  });

  it('should handle nested objects', () => {
    const result = jsonLd({
      '@type': 'Organization',
      address: { '@type': 'PostalAddress', streetAddress: '123 Main St' },
    });
    const parsed = JSON.parse(result.replace(/\\u003c/g, '<'));

    expect(parsed.address['@type']).toBe('PostalAddress');
  });
});

describe('websiteJsonLd', () => {
  it('should generate WebSite schema', () => {
    const result = websiteJsonLd('My Site', 'https://example.com');
    const parsed = JSON.parse(result);

    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('My Site');
    expect(parsed.url).toBe('https://example.com');
  });
});

describe('organizationJsonLd', () => {
  it('should generate Organization schema', () => {
    const result = organizationJsonLd({
      name: 'Acme',
      url: 'https://acme.com',
      logo: 'https://acme.com/logo.png',
      sameAs: ['https://twitter.com/acme'],
    });
    const parsed = JSON.parse(result);

    expect(parsed['@type']).toBe('Organization');
    expect(parsed.name).toBe('Acme');
    expect(parsed.logo).toBe('https://acme.com/logo.png');
    expect(parsed.sameAs).toEqual(['https://twitter.com/acme']);
  });

  it('should omit optional fields when not provided', () => {
    const result = organizationJsonLd({ name: 'Acme', url: 'https://acme.com' });
    const parsed = JSON.parse(result);

    expect(parsed.logo).toBeUndefined();
    expect(parsed.sameAs).toBeUndefined();
  });
});
