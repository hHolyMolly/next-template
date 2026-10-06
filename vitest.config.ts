import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Explicit aliases mirror `paths` from tsconfig.json. We configure them directly
  // instead of `vite-tsconfig-paths` because the default tsconfig excludes test
  // files, which causes the plugin to skip applying aliases to `*.test.tsx`.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.d.ts',
        'src/types/**',
        'src/app/**/layout.tsx',
        'src/app/**/page.tsx',
      ],
      // Ratchet baseline — raise as coverage grows, never lower.
      // (v2.3.0 measured 44/50/36/45 — floors sit ~5pp below.)
      thresholds: {
        statements: 40,
        branches: 45,
        functions: 30,
        lines: 40,
        // The security-critical layer is held to a real bar.
        'src/lib/**': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
});
