/**
 * Centralized API path catalog. Keep every endpoint here so call sites stay
 * grep-able and refactors require a single touch point.
 *
 * Conventions:
 * - Static collections → string literals (`'/users'`).
 * - Dynamic resources → function returning a path (`user: (id) => \`/users/${id}\``).
 * - Group by resource. Sort alphabetically within a group.
 */
const API_PATHS = {
  // Example resource — replace with your own.
  todos: '/todos',
  todo: (id: string | number) => `/todos/${id}`,
} as const;

export default API_PATHS;
