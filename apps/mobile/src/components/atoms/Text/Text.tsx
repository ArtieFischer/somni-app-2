import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'inverse' | 'disabled';
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
    const baseStyle = theme.typography[variant];
    const textColor = theme.colors.text[color];
    
    return {
      ...baseStyle,
      color: textColor,
    };
  };
  
  return (
    <RNText style={[getTextStyle(), style]} {...props}>
      {children}
    </RNText>
  );
};