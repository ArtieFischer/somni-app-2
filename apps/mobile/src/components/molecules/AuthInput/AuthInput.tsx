import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Text } from '../../atoms';
import { useTheme } from '../../../hooks/useTheme';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  ...props
}) => {
  const theme = useTheme();
  const styles = createStyles(theme, !!error);

  return (
    <View style={styles.container}>
      <Text variant="caption" color="secondary" style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.text.disabled}
        autoCapitalize="none"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: any, hasError: boolean) =>
  StyleSheet.create({
    container: { marginBottom: theme.spacing.medium, width: '100%' },
    label: { marginBottom: theme.spacing.small },
    input: {
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: hasError
        ? theme.colors.status.error
        : theme.colors.border.primary,
      fontSize: 16,
    },
    errorText: {
      color: theme.colors.status.error,
      marginTop: theme.spacing.xs,
      fontSize: 12,
    },
  });
