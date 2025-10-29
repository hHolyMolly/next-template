import { type Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,json}'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--white-rgb), <alpha-value>)',
        black: 'rgb(var(--black-rgb), <alpha-value>)',
      },
    },

    screens: {},

    fontFamily: {},
  },

  future: {
    hoverOnlyWhenSupported: true,
  },

  plugins: [],
} satisfies Config;
