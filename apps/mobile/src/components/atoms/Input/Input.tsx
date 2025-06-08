import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = useStyles(theme, variant, size, isFocused, !!error);

  const inputHeight = {
    small: 40,
    medium: 48,
    large: 56,
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.text.disabled}
          selectionColor={theme.colors.primary}
          {...textInputProps}
        />

        {rightIcon && (
          <Pressable
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {(error || helperText) && (
        <Text style={error ? styles.errorText : styles.helperText}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const useStyles = (
  theme: Theme,
  variant: 'outlined' | 'filled',
  size: 'small' | 'medium' | 'large',
  isFocused: boolean,
  hasError: boolean,
) => {
  const inputHeight = {
    small: 40,
    medium: 48,
    large: 56,
  };

  return StyleSheet.create({
    container: {
      marginBottom: theme.spacing.medium,
    },
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.small,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: inputHeight[size],
      backgroundColor:
        variant === 'filled'
          ? theme.colors.background.secondary
          : 'transparent',
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: hasError
        ? theme.colors.status.error
        : isFocused
          ? theme.colors.border.focus
          : theme.colors.border.primary,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.medium,
      // Subtle glow effect when focused
      ...(isFocused && theme.shadows.small),
    },
    input: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      fontWeight: theme.typography.body.fontWeight as any,
      color: theme.colors.text.primary,
      padding: 0, // Remove default padding
    },
    leftIcon: {
      marginRight: theme.spacing.small,
    },
    rightIcon: {
      marginLeft: theme.spacing.small,
      padding: theme.spacing.xs,
    },
    errorText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.status.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
  });
};
