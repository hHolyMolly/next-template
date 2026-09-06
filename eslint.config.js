import tanstackQuery from '@tanstack/eslint-plugin-query';
import nextConfig from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

// Note: jsx-a11y is already registered by `eslint-config-next/core-web-vitals` —
// adding `jsxA11y.flatConfigs.recommended` causes a "Cannot redefine plugin" error.

const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...tanstackQuery.configs['flat/recommended'],
  {
    // `import` plugin is registered by eslint-config-next — configuring
    // `import/*` rules below reuses that instance (re-registering our own
    // copy triggers "Cannot redefine plugin").
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'react/display-name': 'off',

      // Type-aware rules (`no-floating-promises`, `no-misused-promises`,
      // `no-unnecessary-condition`, `prefer-nullish-coalescing`, `prefer-optional-chain`)
      // require `parserOptions.project` and are expensive for large repos.
      // Enable them selectively if you wire up typed linting in CI.
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'warn',

      // Disallow bare `console.*` — force all logging through @/utils/logger
      // so we get prefixes, child scopes, and production silencing for free.
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Enforce stable import ordering: builtins → external → internal (@/) → relative.
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
            { pattern: '@public/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Barrel-file hygiene — importing a barrel from *inside* the same
      // feature folder creates circular dependencies and defeats tree-shaking
      // that only works across module boundaries. Prefer deep imports within
      // the feature, barrels only for external consumers.
      'import/no-self-import': 'error',
      'import/no-cycle': ['warn', { maxDepth: 3 }],
      // Namespace re-exports (`export *`) are the most common barrel footgun
      // — they drag every sibling module into the same chunk.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Prefer explicit named re-exports (`export { foo } from ...`) over `export * from ...`.',
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
  },
  {
    // Allow `console.*` in Node-only infra files where logger isn't available yet,
    // and in the logger implementation itself.
    files: [
      'next.config.ts',
      'scripts/**/*.{js,mjs,ts}',
      'vitest.config.ts',
      'vitest.setup.ts',
      'src/utils/logger.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Test files legitimately use `<a href="...">` for asChild/slot tests and
    // sometimes trigger type-aware rules that don't apply to jsdom runs.
    files: ['**/*.{test,spec}.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react-hooks/refs': 'off',
    },
  },
  {
    // Config files conventionally `export default { ... }` or arrow functions —
    // forcing a named variable adds noise without catching anything useful.
    files: [
      '*.config.{js,cjs,mjs,ts}',
      'postcss.config.{js,cjs,mjs}',
      'stylelint.config.{js,cjs,mjs}',
      'next.config.{js,ts}',
      'tailwind.config.{js,ts}',
      'vitest.config.{js,ts}',
    ],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    // next/font/google injects its own <link rel="preconnect" …> tags. The
    // lint rule only pattern-matches on `fonts.googleapis.com`, which we do
    // not add manually (we preconnect to `fonts.gstatic.com` — the asset
    // origin — which is what actually speeds up font loads).
    files: ['src/app/**/layout.tsx'],
    rules: {
      '@next/next/google-font-preconnect': 'off',
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['node_modules/**', '.next/**', 'build/**', 'coverage/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
