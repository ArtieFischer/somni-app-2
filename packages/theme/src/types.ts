export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      primary: string;
      secondary: string;
      elevated: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      inverse: string;
      disabled: string;
    };
    button: {
      primary: { background: string; text: string; border: string };
      secondary: { background: string; text: string; border: string };
      ghost: { background: string; text: string; border: string };
    };
    status: {
      error: string;
      warning: string;
      success: string;
      info: string;
      recording: string;
    };
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
  };
  spacing: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
    button: {
      small: { fontSize: number; fontWeight: string };
      medium: { fontSize: number; fontWeight: string };
      large: { fontSize: number; fontWeight: string };
    };
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    round: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}