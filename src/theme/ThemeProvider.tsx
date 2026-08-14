import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';
import tokens from './tokens';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = typeof tokens.light;
export type ThemeGradients = typeof tokens.gradients.light;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: ThemeGradients;
  radius: typeof tokens.radius;
  spacing: typeof tokens.spacing;
  fontSize: typeof tokens.fontSize;
  fontWeight: typeof tokens.fontWeight;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Resolves the active theme from the device's system appearance
 * (falls back to 'light' when the system scheme is unavailable) and
 * exposes it via useTheme(). Also stamps a `.dark` class on its root
 * View so NativeWind's CSS-variable-driven color tokens (see global.css)
 * switch along with it.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const mode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: tokens[mode],
      gradients: tokens.gradients[mode],
      radius: tokens.radius,
      spacing: tokens.spacing,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className={mode === 'dark' ? 'dark flex-1' : 'flex-1'}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
