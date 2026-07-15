import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ice-blue tech brand system for Qtech.
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Warm sand palette — the "beach" base for V12 summer theme.
        sand: {
          50: '#fffdf8',
          100: '#fdf6ec',
          200: '#fae9d3',
          300: '#f4d3a8',
          400: '#ecb97a',
          500: '#e0a062',
          600: '#c9854a',
          700: '#a9683c',
          800: '#884f33',
          900: '#6e412c',
        },
        // Coral / sunset accent palette — the warm "ocean sunset" highlight.
        coral: {
          50: '#fff1ec',
          100: '#ffe0d4',
          200: '#ffc1ad',
          300: '#ff9a82',
          400: '#ff7159',
          500: '#fb573d',
          600: '#ec3f24',
          700: '#c92c14',
          800: '#a32412',
          900: '#842414',
        },
        // Deep navy used for headings / footer.
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 45%, #22d3ee 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #fb573d 0%, #f97316 50%, #fbbf24 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
