import tokens from './tokens';

export { ThemeProvider, useTheme } from './ThemeProvider';
export type { ThemeColors, ThemeGradients, ThemeMode } from './ThemeProvider';

// Theme-independent tokens — safe to use statically anywhere.
export const radius = tokens.radius;
export const spacing = tokens.spacing;
export const fontSize = tokens.fontSize;
export const fontWeight = tokens.fontWeight;
// Accent colors (brand/status/schedule) are identical in both palettes.
export const brandColors = tokens.light.brand;
export const statusColors = tokens.light.status;
export const scheduleColors = tokens.light.schedule;

// Static palettes, for the rare case a value is needed outside a component
// (e.g. building a per-mode navigation theme). Prefer useTheme() in components.
export const lightColors = tokens.light;
export const darkColors = tokens.dark;
export const lightGradients = tokens.gradients.light;
export const darkGradients = tokens.gradients.dark;

export const theme = {
  radius,
  spacing,
  fontSize,
  fontWeight,
} as const;

export default theme;
