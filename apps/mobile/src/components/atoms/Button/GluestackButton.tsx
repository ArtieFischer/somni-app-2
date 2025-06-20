import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
  ButtonGroup,
} from '@gluestack-ui/themed';
import { useTheme } from '../../../hooks/useTheme';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'link';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  action = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  onPress,
  ...props
}) => {
  const theme = useTheme();

  // Custom styling based on our theme
  const getCustomProps = () => {
    if (variant === 'solid' && action === 'primary') {
      return {
        bg: '$primary500',
        borderColor: '$primary500',
        '$hover-bg': '$primary600',
        '$active-bg': '$primary700',
      };
    }
    return {};
  };

  return (
    <GluestackButton
      variant={variant}
      action={action}
      size={size}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      {...getCustomProps()}
      {...props}
    >
      {isLoading && <ButtonSpinner mr="$1" />}
      {leftIcon && !isLoading && <ButtonIcon as={leftIcon} mr="$2" />}
      <ButtonText>{children}</ButtonText>
      {rightIcon && <ButtonIcon as={rightIcon} ml="$2" />}
    </GluestackButton>
  );
};

export { ButtonGroup };