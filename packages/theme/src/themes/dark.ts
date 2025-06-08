import { colors } from '../colors';
import { spacing } from '../spacing';
import { typography } from '../typography';
import { Theme } from '../index';

export const darkTheme: Theme = {
  colors: {
    primary: colors.purple[400],
    secondary: colors.blue[400],
    accent: colors.purple[300],
    background: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      elevated: colors.gray[800],
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: colors.white,
      secondary: colors.gray[300],
      inverse: colors.gray[900],
      disabled: colors.gray[500],
    },
    button: {
      primary: {
        background: colors.purple[500],
        text: colors.white,
        border: colors.purple[500],
      },
      secondary: {
        background: colors.gray[800],
        text: colors.purple[400],
        border: colors.purple[400],
      },
      ghost: {
        background: colors.transparent,
        text: colors.purple[400],
        border: colors.purple[400],
      },
    },
    status: {
      error: colors.red[400],
      warning: colors.yellow[400],
      success: colors.green[400],
      info: colors.blue[400],
    },
    border: {
      primary: colors.gray[700],
      secondary: colors.gray[600],
      focus: colors.purple[400],
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
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};