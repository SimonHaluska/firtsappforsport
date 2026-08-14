import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { darkColors, lightColors, type ThemeMode } from '../theme';

export function getNavigationTheme(mode: ThemeMode): Theme {
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const colors = mode === 'dark' ? darkColors : lightColors;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.brand.primary,
      background: colors.background.DEFAULT,
      card: colors.background.surface,
      text: colors.text.primary,
      border: colors.border.DEFAULT,
      notification: colors.status.danger,
    },
  };
}
