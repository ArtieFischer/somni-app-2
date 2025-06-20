import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'inverse' | 'disabled' | 'error';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const getTextStyle = () => {
    // Handle label variant which doesn't exist in typography
    const baseStyle = variant === 'label' 
      ? { fontSize: 14, fontWeight: '600', lineHeight: 20 }
      : theme.typography[variant];
    
    // Handle error color which maps to status.error
    const textColor = color === 'error' 
      ? theme.colors.status.error 
      : theme.colors.text[color];

    return {
      ...baseStyle,
      fontWeight: baseStyle?.fontWeight as any,
      color: textColor,
    };
  };

  return (
    <RNText style={[getTextStyle(), style]} {...props}>
      {children}
    </RNText>
  );
};
