import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup as GluestackButtonGroup,
} from '@gluestack-ui/themed';
import { PressableProps } from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: string;
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  variant?: 'link' | 'outline' | 'solid';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: any;
  rightIcon?: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  action = 'primary',
  variant = 'solid',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  ...pressableProps
}) => {
  return (
    <GluestackButton
      action={action}
      variant={variant}
      size={size}
      isDisabled={isDisabled || isLoading}
      {...pressableProps}
    >
      {isLoading && <ButtonSpinner mr="$1" />}
      {leftIcon && !isLoading && <ButtonIcon as={leftIcon} mr="$1" />}
      <ButtonText>{children}</ButtonText>
      {rightIcon && <ButtonIcon as={rightIcon} ml="$1" />}
    </GluestackButton>
  );
};

export interface ButtonGroupProps {
  children: React.ReactNode;
  isAttached?: boolean;
  isDisabled?: boolean;
  direction?: 'row' | 'column';
  space?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  isAttached = false,
  isDisabled = false,
  direction = 'row',
  space = 'md',
}) => {
  return (
    <GluestackButtonGroup
      isAttached={isAttached}
      isDisabled={isDisabled}
      flexDirection={direction}
      space={space}
    >
      {children}
    </GluestackButtonGroup>
  );
};