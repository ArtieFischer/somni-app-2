// apps/mobile/src/components/ui/AuthInput.tsx
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, value, ...props }: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={value || ''} // Fix: Ensure value is always a string
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#ccc',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E53935', // A reddish color for errors
  },
  errorText: {
    color: '#E53935',
    marginTop: 4,
    fontSize: 12,
  },
});