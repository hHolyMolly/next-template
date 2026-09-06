import { describe, expect, it } from 'vitest';

import {
  isAppError,
  NotFoundError,
  RateLimitError,
  toErrorResponse,
  ValidationError,
} from '@/lib/errors';

describe('toErrorResponse', () => {
  it('maps ValidationError to 400 with code and field details', async () => {
    const response = toErrorResponse(new ValidationError('email is required', 'email'));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: Record<string, unknown> };
    expect(body.error).toMatchObject({
      code: 'VALIDATION',
      message: 'email is required',
      field: 'email',
    });
  });

  it('maps each AppError subclass to its status', () => {
    expect(toErrorResponse(new NotFoundError('nope')).status).toBe(404);
    expect(toErrorResponse(new RateLimitError('slow down')).status).toBe(429);
  });

  it('sanitizes unknown errors to a generic 500', async () => {
    const response = toErrorResponse(new Error('secret internal detail'));

    expect(response.status).toBe(500);
    const body = (await response.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('INTERNAL');
    expect(body.error.message).not.toContain('secret');
  });
});

describe('isAppError', () => {
  it('narrows AppError instances only', () => {
    expect(isAppError(new ValidationError('x'))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(isAppError('string')).toBe(false);
  });
});
