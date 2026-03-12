import { describe, it, expect } from 'vitest';

import { routing } from '@/services/i18n/routing';
import { locales, defaultLocale, namespaces } from '@/services/i18n/constants';

describe('i18n routing', () => {
  it('defines locales from project config', () => {
    expect(routing.locales).toBeDefined();
    expect(routing.locales.length).toBeGreaterThan(0);
  });

  it('has a valid default locale', () => {
    expect(routing.defaultLocale).toBeDefined();
    expect(routing.locales).toContain(routing.defaultLocale);
  });

  it('enables locale detection when multiple locales exist', () => {
    if (locales.length > 1) {
      expect(routing.localeDetection).toBe(true);
    } else {
      expect(routing.localeDetection).toBe(false);
    }
  });

  it('uses "as-needed" prefix when multiple locales exist', () => {
    if (locales.length > 1) {
      expect(routing.localePrefix).toBe('as-needed');
    } else {
      expect(routing.localePrefix).toBe('never');
    }
  });
});

describe('i18n constants', () => {
  it('exports locales array', () => {
    expect(Array.isArray(locales)).toBe(true);
    expect(locales.length).toBeGreaterThan(0);
  });

  it('exports defaultLocale', () => {
    expect(defaultLocale).toBeDefined();
    expect(typeof defaultLocale).toBe('string');
  });

  it('exports namespaces array', () => {
    expect(Array.isArray(namespaces)).toBe(true);
    expect(namespaces).toContain('translations');
    expect(namespaces).toContain('metadata');
  });

  it('defaultLocale is included in locales', () => {
    expect(locales).toContain(defaultLocale);
  });
});
