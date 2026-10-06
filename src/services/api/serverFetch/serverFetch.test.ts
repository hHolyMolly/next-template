// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { serverFetch, ServerFetchError } from '@/services/api/serverFetch';
import { logger } from '@/utils/logger';

const URL_ = 'https://api.test/users';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('serverFetch', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('parses a JSON body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }));
    await expect(serverFetch<{ id: number }>(URL_)).resolves.toEqual({ id: 1 });
  });

  it('accepts structured JSON media types (application/problem+json)', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', { headers: { 'content-type': 'application/problem+json' } }),
    );
    await expect(serverFetch(URL_)).resolves.toEqual({ ok: true });
  });

  it('resolves to undefined on 204', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(serverFetch(URL_)).resolves.toBeUndefined();
  });

  it('serializes `json` and sets the content-type', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await serverFetch(URL_, { method: 'POST', json: { a: 1 } });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('{"a":1}');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
  });

  it('rejects `json` and `body` together', async () => {
    await expect(serverFetch(URL_, { json: {}, body: 'x' })).rejects.toThrow(/either/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps upstream statuses onto the error taxonomy', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404, statusText: 'Not Found' }));
    await expect(serverFetch(URL_)).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    fetchMock.mockResolvedValueOnce(new Response('', { status: 429 }));
    await expect(serverFetch(URL_)).rejects.toMatchObject({ status: 429, code: 'RATE_LIMITED' });

    fetchMock.mockResolvedValueOnce(new Response('', { status: 503 }));
    await expect(serverFetch(URL_)).rejects.toMatchObject({ status: 503, code: 'INTERNAL' });
  });

  it('reports a non-JSON 200 as a 502 (bad upstream), never as success', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html>proxy error</html>', { headers: { 'content-type': 'text/html' } }),
    );
    const err = await serverFetch(URL_).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ServerFetchError);
    expect(err).toMatchObject({ status: 502, code: 'INTERNAL', url: URL_ });
  });

  it('logs network failures but not caller-initiated aborts', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(serverFetch(URL_)).rejects.toThrow('fetch failed');
    expect(logger.error).toHaveBeenCalledTimes(1);

    const controller = new AbortController();
    controller.abort();
    fetchMock.mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    await expect(serverFetch(URL_, { signal: controller.signal })).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
