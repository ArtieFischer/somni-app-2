import { darkTheme, Theme } from '@somni/theme';

/**
 * Hook that returns the oniric dark theme
 * Somni is designed for nighttime use with a dreamlike aesthetic
 */
export const useTheme = (): Theme => {
  // Always return dark theme for the oniric dream experience
  return darkTheme;
};