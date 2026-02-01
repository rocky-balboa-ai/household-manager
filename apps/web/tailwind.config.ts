import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warm: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#faecd8',
          300: '#f5dbb8',
          400: '#e9bb7a',
          500: '#d9973b',
          600: '#c27c1e',
          700: '#a1651a',
          800: '#82511b',
          900: '#6b4419',
        },
      },
    },
  },
  plugins: [],
};

export default config;
