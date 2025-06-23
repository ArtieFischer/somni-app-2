import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
  noPadding?: boolean;
  marginHorizontal?: number;
  marginBottom?: number;
  shadowIntensity?: 'light' | 'medium' | 'strong';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  noPadding = false,
  marginHorizontal = 16,
  marginBottom,
  shadowIntensity = 'medium'
}) => {
  const theme = useTheme();
  
  const getShadowProps = () => {
    const shadows = {
      light: {
        shadowColor: '#A78BFA', // Lighter purple
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      },
      medium: {
        shadowColor: '#A78BFA', // Lighter purple for better visibility
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, // Increased for more visibility
        shadowRadius: 12,
        elevation: 8,
      },
      strong: {
        shadowColor: '#A78BFA', // Lighter purple
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
      }
    };
    return shadows[shadowIntensity];
  };

  const cardStyles = [
    styles.card,
    {
      backgroundColor: variant === 'elevated' 
        ? theme.colors.background.elevated 
        : theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      padding: noPadding ? 0 : theme.spacing.large,
      marginHorizontal,
      marginBottom: marginBottom ?? theme.spacing.medium,
      ...getShadowProps(),
    },
    style
  ];

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  }
});