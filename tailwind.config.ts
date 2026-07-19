import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // V46: the category accent system (src/lib/accents.ts) stores literal
    // Tailwind class strings (border / glow / pill). It must be scanned so the
    // JIT compiler emits them — otherwise the product-card category borders and
    // hover glows silently fail to render.
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
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
        // Warm gold accent scale for premium dark themes / CTAs.
        gold: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
          800: '#92400E', 900: '#78350F',
        },
        // V30 "ocean" theme — teal/aqua surface language for the product system
        // and new components. Added alongside (never replacing) the existing
        // brand / gold system.
        ocean: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
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
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        lift: '0 12px 32px rgba(15, 23, 42, 0.10)',
        'glow-brand': '0 18px 50px -12px rgba(8,145,178,0.45)',
        'glow-gold': '0 18px 50px -12px rgba(245,158,11,0.40)',
        'glow-emerald': '0 18px 50px -12px rgba(16,185,129,0.40)',
        // V30 ocean shadows — soft aqua glow for glass surfaces.
        ocean: '0 12px 40px -12px rgba(13,148,136,0.35)',
        'ocean-lg': '0 24px 60px -16px rgba(13,148,136,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 45%, #22d3ee 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        'ink-gradient': 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #164E63 100%)',
        // V30 ocean gradient — the signature aqua sheen used by glass surfaces.
        'ocean-gradient': 'linear-gradient(135deg, rgba(20,184,166,0.25) 0%, rgba(6,182,212,0.15) 50%, rgba(59,130,246,0.20) 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
