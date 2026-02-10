import { type Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,json}'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--white-rgb), <alpha-value>)',
        black: 'rgb(var(--black-rgb), <alpha-value>)',
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },

  future: {
    hoverOnlyWhenSupported: true,
  },

  plugins: [],
} satisfies Config;
