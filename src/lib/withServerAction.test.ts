import { describe, expect, it } from 'vitest';

import { NotFoundError, ValidationError } from '@/lib/errors';
import { withServerAction } from '@/lib/withServerAction';

describe('withServerAction', () => {
  it('wraps a successful result', async () => {
    const action = withServerAction(async (n: number) => n * 2);
    await expect(action(21)).resolves.toEqual({ success: true, data: 42 });
  });

  it('maps AppError to the shared envelope with nested details', async () => {
    const action = withServerAction(async () => {
      throw new ValidationError('email is required', 'email');
    });
    await expect(action()).resolves.toEqual({
      success: false,
      error: { code: 'VALIDATION', message: 'email is required', details: { field: 'email' } },
    });
  });

  it('sanitizes unknown errors to INTERNAL', async () => {
    const action = withServerAction(async () => {
      throw new Error('secret stack detail');
    });
    const result = await action();
    expect(result).toEqual({
      success: false,
      error: { code: 'INTERNAL', message: 'Internal Server Error' },
    });
  });

  it('re-throws Next.js control-flow errors (redirect/notFound)', async () => {
    // Next signals redirect()/notFound() by throwing an error whose digest
    // starts with NEXT_ — swallowing it would break navigation.
    const redirectErr = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/target;307;',
    });
    const action = withServerAction(async () => {
      throw redirectErr;
    });
    await expect(action()).rejects.toBe(redirectErr);
  });

  it('does not re-throw AppErrors that happen to have no digest', async () => {
    const action = withServerAction(async () => {
      throw new NotFoundError('nope');
    });
    await expect(action()).resolves.toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' },
    });
  });
});
