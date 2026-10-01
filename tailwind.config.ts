import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '384px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // ─── Cliniva Premium Healthcare Color Palette ───
      colors: {
        // Primary Medical Teal: #0F8B8D
        primary: '#0F8B8D',
        'on-primary': '#FFFFFF',
        'primary-container': '#E8F6F5',
        'on-primary-container': '#123047',
        'primary-fixed': '#E8F6F5',
        'primary-fixed-dim': '#C4ECE9',
        'on-primary-fixed': '#123047',
        'on-primary-fixed-variant': '#0F8B8D',
        'inverse-primary': '#28B5B7',

        // Primary & Navies
        'primary-navy': '#123047',
        'secondary-navy': '#1B3A4B',
        'medical-teal': '#0F8B8D',
        'light-teal': '#E8F6F5',
        accent: '#0F8B8D',
        'light-accent': '#E8F6F5',
        'primary-text': '#172B3A',
        'secondary-text': '#60727F',
        'border-subtle': '#E2E8EC',

        // Secondary: Dark Navy / Slate
        secondary: '#1B3A4B',
        'on-secondary': '#FFFFFF',
        'secondary-container': '#E2E8EC',
        'on-secondary-container': '#123047',

        // Tertiary / Error
        tertiary: '#C94A4A',
        'on-tertiary': '#FFFFFF',
        'tertiary-container': '#FDE8E8',
        'on-tertiary-container': '#7D1A1A',

        // Error
        error: '#C94A4A',
        'on-error': '#FFFFFF',
        'error-container': '#FDE8E8',
        'on-error-container': '#7D1A1A',

        // Surfaces (canvas, cards, layers) — CSS-var-driven
        surface: 'var(--color-surface, #F7F9FA)',
        'surface-dim': 'var(--color-surface-dim, #EEF2F5)',
        'surface-bright': 'var(--color-surface-bright, #FFFFFF)',
        'surface-container-lowest': 'var(--color-surface-container-lowest, #FFFFFF)',
        'surface-container-low': 'var(--color-surface-container-low, #F7F9FA)',
        'surface-container': 'var(--color-surface-container, #F0F4F7)',
        'surface-container-high': 'var(--color-surface-container-high, #E2E8EC)',
        'surface-container-highest': 'var(--color-surface-container-highest, #D5DFE6)',
        'surface-variant': 'var(--color-surface-container, #F0F4F7)',
        'surface-tint': '#0F8B8D',

        // On-surfaces (text, icons)
        'on-surface': 'var(--color-on-surface, #172B3A)',
        'on-surface-variant': 'var(--color-on-surface-variant, #60727F)',
        'on-background': 'var(--color-on-surface, #172B3A)',
        background: 'var(--color-surface, #F7F9FA)',

        // Inverse
        'inverse-surface': '#123047',
        'inverse-on-surface': '#F7F9FA',

        // Borders
        outline: 'var(--color-outline, #A0B0BC)',
        'outline-variant': 'var(--color-outline-variant, #E2E8EC)',

        // Semantic status colors (clinical meanings only)
        'status-success': '#2E7D5B',
        'status-warning': '#C58A24',
        'status-error': '#C94A4A',
        'status-neutral': '#60727F',
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

      // ─── Moderate Border Radius (Soft Clinical UI) ───
      borderRadius: {
        DEFAULT: '0.375rem', // 6px
        sm: '0.25rem',        // 4px
        md: '0.5rem',         // 8px
        lg: '0.625rem',       // 10px
        xl: '0.75rem',        // 12px
        '2xl': '0.875rem',    // 14px
        '3xl': '1rem',        // 16px
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

      // ─── Subtle Shadows (Soft, calm healthcare elevation) ───
      boxShadow: {
        xs: '0 1px 2px 0 rgba(18, 48, 71, 0.03)',
        card: '0 1px 3px 0 rgba(18, 48, 71, 0.04), 0 1px 2px -1px rgba(18, 48, 71, 0.02)',
        'card-hover': '0 3px 6px -1px rgba(18, 48, 71, 0.06), 0 2px 4px -2px rgba(18, 48, 71, 0.03)',
        modal: '0 10px 25px -5px rgba(18, 48, 71, 0.10), 0 8px 10px -6px rgba(18, 48, 71, 0.05)',
        sidebar: '0 1px 4px 0 rgba(18, 48, 71, 0.03)',
        'focus-ring': '0 0 0 3px rgba(15, 139, 141, 0.15)',
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
