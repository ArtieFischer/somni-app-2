import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ title, onPress, isLoading, disabled, style, textStyle }: ButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}>
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8A2BE2', // A nice purple
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
});