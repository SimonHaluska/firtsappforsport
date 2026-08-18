// Single source of truth for design tokens.
// Plain CommonJS so tailwind.config.js (Node, no TS loader) can require() it directly.
// Re-exported with types for app code via theme/index.ts.

// Accent colors are shared across light/dark — same design language, same brand.
// "Ascent": deep indigo (trust/authority) + growth green (progress/momentum).
// Deliberately no black-as-accent — dark UI leans on navy/indigo instead.
const brand = {
  primary: '#4338CA',
  primaryDark: '#312E81',
  primaryLight: '#818CF8',
  secondary: '#22C55E',
  secondaryDark: '#15803D',
  secondaryLight: '#86EFAC',
  accent: '#F5A623', // reserved for milestones/alerts, not everyday UI
};

const status = {
  // Unified with brand.secondary — "success" and "progress" read as one
  // color, not two competing greens.
  success: brand.secondary,
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

// brand.primary/secondary as *fills* (button backgrounds, gradients, chip
// selected state) stay fixed across modes — that's `brand` above. But used
// bare as foreground (text/icon/border directly on a background, no fill
// behind them), the same hex reads very differently per mode: raw indigo
// nearly disappears into a near-black dark background, while raw green is
// too light to read on a white one. `primaryText`/`secondaryText` are the
// AA-safe per-mode picks for that bare-foreground case — components that
// render brand-colored text/icons/borders should read color from here
// (via useTheme().colors.brand.primaryText/secondaryText), not from the
// raw brand.primary/secondary.
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
  brand: {
    ...brand,
    primaryText: brand.primary, // 7.3-7.9:1 on light backgrounds
    secondaryText: '#166534', // deeper than secondaryDark — raw green/secondaryDark both under 4.5:1 on elevated
  },
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
  brand: {
    ...brand,
    primaryText: brand.primaryLight, // raw primary is only ~2.5:1 on dark backgrounds
    secondaryText: brand.secondary, // raw green is already 7.2-8.6:1 on dark backgrounds
  },
  status,
  schedule,
};

const gradients = {
  light: {
    // primary -> secondaryDark (not raw secondary): the raw indigo->green
    // pairing drops white-text contrast to ~2:1 near the green end.
    primary: ['#4338CA', '#15803D'],
    gold: ['#F5A623', '#FBBF24'],
    danger: ['#F87171', '#EF4444'],
    surface: ['#FFFFFF', '#F5F6FA'],
  },
  dark: {
    primary: ['#4338CA', '#15803D'],
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
