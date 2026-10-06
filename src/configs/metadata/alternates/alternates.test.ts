import { describe, expect, it } from 'vitest';

import { buildLocaleAlternates } from '@/configs/metadata/alternates';

// urls.website falls back to http://localhost:3000 in tests (no env set).
const SITE = 'http://localhost:3000';

describe('buildLocaleAlternates', () => {
  it('keeps the default locale unprefixed and prefixes the others', () => {
    expect(buildLocaleAlternates('/')).toEqual({
      en: SITE,
      ru: `${SITE}/ru`,
      'x-default': SITE,
    });
  });

  it('appends the route path after the locale prefix', () => {
    expect(buildLocaleAlternates('/about')).toEqual({
      en: `${SITE}/about`,
      ru: `${SITE}/ru/about`,
      'x-default': `${SITE}/about`,
    });
  });
});
