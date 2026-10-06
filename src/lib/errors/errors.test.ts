import { describe, expect, it } from 'vitest';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  NotImplementedError,
  toErrorPayload,
  toErrorResponse,
  UnauthorizedError,
  ValidationError,
} from '@/lib/errors';

describe('toErrorResponse', () => {
  it('maps ValidationError to 400 with code and field details', async () => {
    const response = toErrorResponse(new ValidationError('email is required', 'email'));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: Record<string, unknown> };
    // `details` is NESTED (never spread) so it can't shadow code/message.
    expect(body.error).toMatchObject({
      code: 'VALIDATION',
      message: 'email is required',
      details: { field: 'email' },
    });
  });

  it('maps each AppError subclass to its status', () => {
    expect(toErrorResponse(new UnauthorizedError('no')).status).toBe(401);
    expect(toErrorResponse(new ForbiddenError('no')).status).toBe(403);
    expect(toErrorResponse(new NotFoundError('nope')).status).toBe(404);
    expect(toErrorResponse(new ConflictError('taken')).status).toBe(409);
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

describe('toErrorPayload', () => {
  it('nests details so caller keys cannot shadow code/message', () => {
    const err = new ConflictError('taken', { code: 'HACKED', message: 'spoofed' });
    const payload = toErrorPayload(err);
    expect(payload.code).toBe('CONFLICT');
    expect(payload.message).toBe('taken');
    expect(payload.details).toEqual({ code: 'HACKED', message: 'spoofed' });
  });

  it('collapses non-Error throwables to INTERNAL', () => {
    for (const junk of [null, undefined, 'boom', 42, { any: 'thing' }]) {
      expect(toErrorPayload(junk)).toEqual({ code: 'INTERNAL', message: 'Internal Server Error' });
    }
  });

  it('keeps the subclass name on the error instance', () => {
    expect(new NotFoundError('x').name).toBe('NotFoundError');
    expect(new ValidationError('x').name).toBe('ValidationError');
  });
});

describe('NotImplementedError', () => {
  it('maps to 501 NOT_IMPLEMENTED', () => {
    const err = new NotImplementedError('not configured');
    expect(err.status).toBe(501);
    expect(toErrorPayload(err)).toEqual({ code: 'NOT_IMPLEMENTED', message: 'not configured' });
  });
});
