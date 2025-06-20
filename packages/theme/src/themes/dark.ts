import { colors } from '../colors';
import { spacing } from '../spacing';
import { typography } from '../typography';
import { Theme } from '../types';

export const darkTheme: Theme = {
  colors: {
    primary: '#8B5CF6', // Aurora purple
    secondary: '#10B981', // Ethereal teal  
    accent: '#A78BFA', // Mystic lavender
    background: {
      primary: '#0B1426', // Deep midnight
      secondary: '#1A2332', // Darker slate
      elevated: '#252B3A', // Elevated surface
      overlay: 'rgba(11, 20, 38, 0.9)', // Deep overlay
    },
    text: {
      primary: '#F8FAFC', // Starlight white
      secondary: '#CBD5E1', // Soft silver
      inverse: '#0B1426', // Deep midnight for inverse
      disabled: '#64748B', // Muted slate
    },
    button: {
      primary: {
        background: '#8B5CF6', // Aurora purple
        text: '#F8FAFC', // Starlight white
        border: '#8B5CF6',
      },
      secondary: {
        background: 'rgba(139, 92, 246, 0.1)', // Aurora purple with opacity
        text: '#A78BFA', // Mystic lavender
        border: '#6B46C1', // Deep purple
      },
      ghost: {
        background: 'transparent',
        text: '#A78BFA', // Mystic lavender
        border: '#6B46C1', // Deep purple
      },
    },
    status: {
      error: '#F87171', // Soft red
      warning: '#FBBF24', // Warm amber
      success: '#10B981', // Ethereal teal
      info: '#60A5FA', // Dream blue
    },
    border: {
      primary: '#374151', // Soft border
      secondary: '#4B5563', // Medium border
      focus: '#8B5CF6', // Aurora purple focus
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
      shadowColor: '#8B5CF6', // Aurora purple shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#8B5CF6', // Aurora purple shadow
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    large: {
      shadowColor: '#8B5CF6', // Aurora purple shadow
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};