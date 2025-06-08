import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function AuthButton({ 
  title, 
  loading = false, 
  variant = 'primary', 
  disabled,
  ...props 
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        isDisabled && styles.disabledButton,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#007AFF'} />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
          isDisabled && styles.disabledButtonText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  disabledButtonText: {
    opacity: 0.7,
  },
});