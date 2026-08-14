// Single source of truth for design tokens.
// Plain CommonJS so tailwind.config.js (Node, no TS loader) can require() it directly.
// Re-exported with types for app code via theme/index.ts.

// Accent colors are shared across light/dark — same design language, same brand.
const brand = {
  primary: '#7C5CFC',
  primaryDark: '#5B3DF0',
  secondary: '#22D3EE',
  accent: '#F5A623',
};

const status = {
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#38BDF8',
};

const schedule = {
  training: brand.primary,
  match: brand.accent,
  recovery: brand.secondary,
  rest: '#3A3F52',
};

const light = {
  background: {
    DEFAULT: '#FFFFFF',
    surface: '#F5F6FA',
    elevated: '#ECEDF5',
  },
  text: {
    primary: '#14161F',
    secondary: '#5B5F72',
    muted: '#8B8FA3',
    inverse: '#F5F6FA',
  },
  border: {
    DEFAULT: '#DEE1EC',
    subtle: '#E7E9F2',
  },
  brand,
  status,
  schedule,
};

const dark = {
  background: {
    DEFAULT: '#0A0B10',
    surface: '#14161F',
    elevated: '#1C1F2B',
  },
  text: {
    primary: '#F5F6FA',
    secondary: '#A0A4B8',
    muted: '#6B6F80',
    inverse: '#F5F6FA',
  },
  border: {
    DEFAULT: '#262A38',
    subtle: '#1C1F2B',
  },
  brand,
  status,
  schedule,
};

const gradients = {
  light: {
    primary: ['#7C5CFC', '#22D3EE'],
    gold: ['#F5A623', '#FBBF24'],
    danger: ['#F87171', '#EF4444'],
    surface: ['#FFFFFF', '#F5F6FA'],
  },
  dark: {
    primary: ['#7C5CFC', '#22D3EE'],
    gold: ['#F5A623', '#FBBF24'],
    danger: ['#F87171', '#EF4444'],
    surface: ['#1C1F2B', '#0A0B10'],
  },
};

// Colors for Tailwind/NativeWind: point at CSS variables (defined in global.css
// for :root and .dark) so a single className resolves to the active theme.
// Accent colors don't change between themes, so they're inlined directly.
const colors = {
  background: {
    DEFAULT: 'var(--color-background)',
    surface: 'var(--color-background-surface)',
    elevated: 'var(--color-background-elevated)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    inverse: 'var(--color-text-inverse)',
  },
  border: {
    DEFAULT: 'var(--color-border)',
    subtle: 'var(--color-border-subtle)',
  },
  brand,
  status,
  schedule,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 56,
};

const fontSize = {
  xs: ['12px', { lineHeight: '16px' }],
  sm: ['14px', { lineHeight: '20px' }],
  base: ['16px', { lineHeight: '22px' }],
  lg: ['18px', { lineHeight: '24px' }],
  xl: ['22px', { lineHeight: '28px' }],
  '2xl': ['28px', { lineHeight: '34px' }],
  '3xl': ['36px', { lineHeight: '42px' }],
  display: ['48px', { lineHeight: '52px' }],
};

const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

module.exports = {
  light,
  dark,
  gradients,
  colors,
  radius,
  spacing,
  fontSize,
  fontWeight,
};
