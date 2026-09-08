import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('merges tailwind classes and removes duplicates', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional class values', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'visible')).toBe('base visible');
  });
});
