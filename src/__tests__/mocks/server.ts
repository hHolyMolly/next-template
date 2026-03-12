import { setupServer } from 'msw/node';

import { handlers } from '@/__tests__/mocks/handlers';

/**
 * MSW server instance for Node.js testing environment.
 * Automatically started/stopped in test setup.
 *
 * @example
 * // Override handlers for a specific test
 * server.use(
 *   http.get('/api/users', () => {
 *     return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 *   }),
 * );
 */
export const server = setupServer(...handlers);
