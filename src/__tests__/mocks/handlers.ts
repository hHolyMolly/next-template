import { http, HttpResponse } from 'msw';

/**
 * MSW request handlers for API mocking in tests.
 * Add your API handlers here.
 *
 * @example
 * handlers.push(
 *   http.get('/api/users', () => {
 *     return HttpResponse.json([{ id: 1, name: 'John' }]);
 *   }),
 * );
 */
export const handlers = [
  // Example handler — replace with your actual API routes
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
