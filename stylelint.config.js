/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Allow Tailwind v4 directives
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'screen',
          'utility',
          'theme',
          'source',
          'variant',
          'custom-variant',
          'plugin',
          'reference',
        ],
      },
    ],
    'at-rule-no-unknown': null,
    // Tailwind v4 uses string @import ("tailwindcss", "tw-animate-css")
    'import-notation': null,

    // Allow global selectors and :global() in CSS Modules
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],

    // Relax for utility-first approach
    'no-descending-specificity': null,
    'declaration-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
  },
  ignoreFiles: ['node_modules/**', '.next/**', 'build/**', 'dist/**'],
};
