import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Cliniva Soft Clinical Color Palette (from design-system/tokens.json) ───
      colors: {
        // Primary teal palette
        primary: '#00685f',
        'on-primary': '#ffffff',
        'primary-container': '#008378',
        'on-primary-container': '#f4fffc',
        'primary-fixed': '#89f5e7',
        'primary-fixed-dim': '#6bd8cb',
        'on-primary-fixed': '#00201d',
        'on-primary-fixed-variant': '#005049',
        'inverse-primary': '#6bd8cb',

        // Secondary teal
        secondary: '#006b5f',
        'on-secondary': '#ffffff',
        'secondary-container': '#6df5e1',
        'on-secondary-container': '#006f64',
        'secondary-fixed': '#71f8e4',
        'secondary-fixed-dim': '#4fdbc8',
        'on-secondary-fixed': '#00201c',
        'on-secondary-fixed-variant': '#005048',

        // Tertiary (alert/critical — use sparingly)
        tertiary: '#b90538',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#dc2c4f',
        'on-tertiary-container': '#fffbff',
        'tertiary-fixed': '#ffdadb',
        'tertiary-fixed-dim': '#ffb2b7',
        'on-tertiary-fixed': '#40000d',
        'on-tertiary-fixed-variant': '#92002a',

        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Surfaces (canvas, cards, layers)
        surface: 'var(--color-surface, #f8f9ff)',
        'surface-dim': 'var(--color-surface-dim, #cbdbf5)',
        'surface-bright': 'var(--color-surface-bright, #f8f9ff)',
        'surface-container-lowest': 'var(--color-surface-container-lowest, #ffffff)',
        'surface-container-low': 'var(--color-surface-container-low, #eff4ff)',
        'surface-container': 'var(--color-surface-container, #e5eeff)',
        'surface-container-high': 'var(--color-surface-container-high, #dce9ff)',
        'surface-container-highest': 'var(--color-surface-container-highest, #d3e4fe)',
        'surface-variant': 'var(--color-surface-container, #d3e4fe)',
        'surface-tint': '#006a61',

        // On-surfaces (text, icons)
        'on-surface': 'var(--color-on-surface, #0f172a)',
        'on-surface-variant': 'var(--color-on-surface-variant, #334155)',
        'on-background': 'var(--color-on-surface, #0f172a)',
        background: 'var(--color-surface, #f8f9ff)',

        // Inverse
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',

        // Borders
        outline: 'var(--color-outline, #64748b)',
        'outline-variant': 'var(--color-outline-variant, #cbd5e1)',

        // Semantic status colors (design-system spec)
        'status-success': '#27AE60',
        'status-warning': '#F2994A',
        'status-error': '#EB5757',
        'status-neutral': '#9CA3AF',
      },

      // ─── Typography (Plus Jakarta Sans + Inter) ───
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['30px', { lineHeight: '38px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '700' }],
        'telemetry-num': ['24px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '600' }],
      },

      // ─── Border Radius ───
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '1.5rem',
        full: '9999px',
      },

      // ─── Spacing (8px base unit) ───
      spacing: {
        'space-xs': '0.25rem',   // 4px
        'space-sm': '0.5rem',    // 8px
        'space-md': '1rem',      // 16px
        'space-lg': '1.5rem',    // 24px
        'space-xl': '2.25rem',   // 36px
        gutter: '1.25rem',       // 20px
        'gutter-mobile': '0.75rem',
        'gutter-desktop': '1.5rem',
        margin: '1.5rem',
        'margin-mobile': '1rem',
        'margin-desktop': '2rem',
      },

      // ─── Shadows (Soft Layered Depth) ───
      boxShadow: {
        card: '0px 2px 4px rgba(15, 23, 42, 0.03), 0px 8px 16px -4px rgba(13, 148, 136, 0.04)',
        'card-hover': '0px 6px 12px -2px rgba(15, 23, 42, 0.05), 0px 16px 24px -4px rgba(13, 148, 136, 0.06)',
        modal: '0px 20px 32px -8px rgba(15, 23, 42, 0.08), 0px 32px 48px -12px rgba(15, 23, 42, 0.06)',
        sidebar: '0_1px_8px_rgba(0,0,0,0.02)',
        'focus-ring': '0 0 0 3px rgba(20, 184, 166, 0.15)',
      },

      // ─── Animation ───
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // ─── Backdrop ───
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
