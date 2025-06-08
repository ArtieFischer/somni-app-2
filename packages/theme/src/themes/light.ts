import { colors } from '../colors';
import { spacing } from '../spacing';
import { typography } from '../typography';
import { Theme } from '../index';

export const lightTheme: Theme = {
  colors: {
    primary: colors.purple[500],
    secondary: colors.blue[500],
    accent: colors.purple[400],
    background: {
      primary: colors.white,
      secondary: colors.gray[50],
      elevated: colors.white,
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      inverse: colors.white,
      disabled: colors.gray[400],
    },
    button: {
      primary: {
        background: colors.purple[500],
        text: colors.white,
        border: colors.purple[500],
      },
      secondary: {
        background: colors.white,
        text: colors.purple[500],
        border: colors.purple[500],
      },
      ghost: {
        background: colors.transparent,
        text: colors.purple[500],
        border: colors.purple[500],
      },
    },
    status: {
      error: colors.red[500],
      warning: colors.yellow[500],
      success: colors.green[500],
      info: colors.blue[500],
    },
    border: {
      primary: colors.gray[200],
      secondary: colors.gray[300],
      focus: colors.purple[500],
    },
  },
  spacing,
  typography,
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};