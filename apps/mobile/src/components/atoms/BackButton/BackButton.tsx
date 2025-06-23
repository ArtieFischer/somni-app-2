import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface BackButtonProps extends PressableProps {
  onPress: () => void;
  label?: string;
  variant?: 'default' | 'minimal' | 'outlined';
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  onPress, 
  label = 'Back',
  variant = 'outlined',
  style,
  ...props 
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  if (variant === 'minimal') {
    return (
      <Pressable
        style={({ pressed }) => [styles.minimalButton, pressed && { opacity: 0.7 }, style]}
        onPress={onPress}
        {...props}
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, style]}
      onPress={onPress}
      {...props}
    >
      <View style={styles.content}>
        <Ionicons name="chevron-back" size={20} color={theme.colors.secondary} style={styles.icon} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Pressable>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    button: {
      height: 56, // Match large button height
      minHeight: 56, // Ensure minimum height
      maxHeight: 56, // Ensure maximum height
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.secondary, // This is the green color #10B981
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    minimalButton: {
      padding: theme.spacing.small,
      paddingLeft: 0,
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      marginRight: theme.spacing.xs,
    },
    text: {
      fontSize: theme.typography.button.large.fontSize,
      fontWeight: theme.typography.button.large.fontWeight as any,
      color: theme.colors.secondary, // Green text to match border
      textAlign: 'center',
    },
  });
};