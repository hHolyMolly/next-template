import { describe, expect, it } from 'vitest';

import { isWaitingFor } from '@/lib/queryState';

describe('isWaitingFor', () => {
  it('is true while a fetch is in flight', () => {
    expect(isWaitingFor({ isPending: true, fetchStatus: 'fetching' })).toBe(true);
  });

  it('is true while a fetch is paused (offline with networkMode online)', () => {
    expect(isWaitingFor({ isPending: true, fetchStatus: 'paused' })).toBe(true);
  });

  it('is false for a skipToken/disabled query (pending but idle)', () => {
    expect(isWaitingFor({ isPending: true, fetchStatus: 'idle' })).toBe(false);
  });

  it('is false once data arrived', () => {
    expect(isWaitingFor({ isPending: false, fetchStatus: 'idle' })).toBe(false);
  });
});
