import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../../hooks/useTheme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  loading = false,
  disabled,
  ...pressableProps
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const buttonConfig = theme.colors.button[variant];
    const sizeConfig = theme.typography.button[size];

    // Consistent minimum heights for accessibility and visual harmony
    const buttonHeight = {
      small: 40,
      medium: 48,
      large: 56,
    };

    return StyleSheet.create({
      container: {
        backgroundColor: buttonConfig.background,
        borderColor: buttonConfig.border,
        borderWidth: variant === 'ghost' || variant === 'secondary' ? 1 : 0,
        borderRadius: theme.borderRadius.large, // More rounded for oniric feel
        height: buttonHeight[size],
        paddingHorizontal:
          theme.spacing[
            size === 'small' ? 'medium' : size === 'large' ? 'xl' : 'large'
          ],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.6 : 1,
        // Subtle shadow for depth
        ...theme.shadows.small,
      },
      text: {
        color: buttonConfig.text,
        fontSize: sizeConfig.fontSize,
        fontWeight: sizeConfig.fontWeight as any,
        textAlign: 'center',
      },
    });
  };

  const styles = getButtonStyle();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
      disabled={isDisabled}
      {...pressableProps}
    >
      <Text style={styles.text}>{loading ? 'Loading...' : children}</Text>
    </Pressable>
  );
};
