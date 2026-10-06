// @vitest-environment node
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/revalidate/route';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

const SECRET = 'correct-horse-battery-staple';

function post(url: string, init: { headers?: Record<string, string>; body?: unknown } = {}) {
  return POST(
    new NextRequest(`http://localhost:3000${url}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-real-ip': '1.1.1.1',
        ...init.headers,
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    }),
  );
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('REVALIDATE_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('answers 501 NOT_IMPLEMENTED when no secret is configured', async () => {
    vi.stubEnv('REVALIDATE_SECRET', '');
    const res = await post('/api/revalidate?tag=posts', {
      headers: { 'x-revalidate-secret': SECRET },
    });
    expect(res.status).toBe(501);
    await expect(res.json()).resolves.toMatchObject({ error: { code: 'NOT_IMPLEMENTED' } });
  });

  it('answers a constant 403 for a missing or wrong secret', async () => {
    const missing = await post('/api/revalidate?tag=posts');
    const wrong = await post('/api/revalidate?tag=posts', {
      headers: { 'x-revalidate-secret': 'nope-nope-nope-nope' },
    });
    expect(missing.status).toBe(403);
    expect(wrong.status).toBe(403);
    await expect(missing.text()).resolves.toBe(await wrong.text());
  });

  it('ignores a secret passed in the query string', async () => {
    const res = await post(`/api/revalidate?tag=posts&secret=${SECRET}`);
    expect(res.status).toBe(403);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('answers 400 without any target', async () => {
    const res = await post('/api/revalidate', { headers: { 'x-revalidate-secret': SECRET } });
    expect(res.status).toBe(400);
  });

  it('revalidates tags with the "max" profile', async () => {
    const res = await post('/api/revalidate?tag=posts&tag=post:hello', {
      headers: { 'x-revalidate-secret': SECRET },
    });
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('posts', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('post:hello', 'max');
  });

  it('revalidates paths through the [locale] segment so every locale is covered', async () => {
    const res = await post('/api/revalidate', {
      headers: { 'x-revalidate-secret': SECRET },
      body: { paths: ['/blog', '/'] },
    });
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/[locale]/blog', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/[locale]', 'page');
    await expect(res.json()).resolves.toMatchObject({
      revalidated: { paths: ['/blog', '/'], locales: ['ru', 'en'] },
    });
  });

  it('rejects paths that are not app-relative', async () => {
    const res = await post('/api/revalidate', {
      headers: { 'x-revalidate-secret': SECRET },
      body: { paths: ['blog'] },
    });
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
