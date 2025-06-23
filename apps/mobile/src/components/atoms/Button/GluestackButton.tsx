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
  style?: any;
  textStyle?: any;
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
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();

  // Custom styling based on our theme
  const getCustomProps = () => {
    // SOLID variant - purple background for primary CTA buttons
    if (variant === 'solid' && action === 'primary') {
      return {
        bg: theme.colors.button.primary.background,
        borderColor: theme.colors.button.primary.border,
        '$hover-bg': theme.colors.primary,
        '$active-bg': theme.colors.primary,
      };
    }

    // OUTLINE variant - green border/text, transparent background for secondary buttons
    if (variant === 'outline') {
      return {
        bg: 'transparent',
        borderColor: theme.colors.button.secondary.border,
        borderWidth: 1,
        '$hover-bg': `${theme.colors.button.secondary.background}10`,
        '$active-bg': `${theme.colors.button.secondary.background}20`,
      };
    }

    // LINK variant - light text with underline for minor actions
    if (variant === 'link') {
      return {
        bg: 'transparent',
        borderColor: 'transparent',
        '$hover-bg': 'transparent',
        '$active-bg': 'transparent',
      };
    }

    return {};
  };
  
  // Get text color based on variant
  const getTextColor = () => {
    if (variant === 'solid') return theme.colors.button.primary.text;
    if (variant === 'outline') return theme.colors.button.secondary.text;
    if (variant === 'link') return theme.colors.button.ghost.text;
    return theme.colors.text.primary;
  };
  
  // Get text decoration
  const getTextDecoration = () => {
    return variant === 'link' ? 'underline' : 'none';
  };

  const customProps = getCustomProps();

  return (
    <GluestackButton
      variant={variant}
      action={action}
      size={size}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      style={style}
      {...customProps}
      {...props}
    >
      {isLoading && <ButtonSpinner mr="$1" />}
      {leftIcon && !isLoading && <ButtonIcon as={leftIcon} mr="$2" />}
      <ButtonText
        style={[
          {
            color: getTextColor(),
            textDecorationLine: getTextDecoration(),
          },
          textStyle
        ]}
      >
        {children}
      </ButtonText>
      {rightIcon && <ButtonIcon as={rightIcon} ml="$2" />}
    </GluestackButton>
  );
};

export { ButtonGroup };
