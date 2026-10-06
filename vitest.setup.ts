import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// RTL auto-cleans between tests when `afterEach` is a global (vitest `globals: true`).

// `server-only` throws outside a React Server Components bundle (Next
// aliases it per layer; vitest has no such layer). Neutralise it globally so
// server-only modules (serverFetch) can be unit-tested.
vi.mock('server-only', () => ({}));

// Browser-only shims. Files that opt into `// @vitest-environment node`
// (route handlers, server helpers) have no `window` — skip them there.
if (typeof window !== 'undefined') {
  // jsdom does not implement matchMedia — required for useMediaQuery and similar hooks.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

  // jsdom does not implement IntersectionObserver / ResizeObserver.
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  (globalThis as { IntersectionObserver: unknown }).IntersectionObserver = NoopObserver;
  (globalThis as { ResizeObserver: unknown }).ResizeObserver = NoopObserver;
}
