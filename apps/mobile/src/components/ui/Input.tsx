import React, { forwardRef } from 'react';
import {
  Input as GluestackInput,
  InputField as GluestackInputField,
  InputSlot as GluestackInputSlot,
  InputIcon as GluestackInputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { AlertCircleIcon } from '@gluestack-ui/themed';
import { TextInputProps } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../hooks/useTheme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'underlined';
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  leftIcon?: any;
  rightIcon?: any;
  onRightIconPress?: () => void;
}

export const Input = forwardRef<any, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'outline',
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...inputProps
}, ref) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hasError = isInvalid || !!error;

  return (
    <FormControl 
      isRequired={isRequired} 
      isInvalid={hasError} 
      isDisabled={isDisabled}
      size={size}
    >
      {label && (
        <FormControlLabel>
          <FormControlLabelText style={{ color: theme.colors.text.primary }}>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      
      <GluestackInput 
        variant={variant} 
        size={size} 
        isDisabled={isDisabled}
        borderColor={theme.colors.border.primary}
        $focus={{
          borderColor: theme.colors.primary,
        }}
      >
        {leftIcon && (
          <GluestackInputSlot pl="$3">
            <GluestackInputIcon as={leftIcon} />
          </GluestackInputSlot>
        )}
        
        <GluestackInputField
          ref={ref}
          {...inputProps}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            {
              color: theme.colors.text.primary,
              backgroundColor: variant === 'filled' ? theme.colors.background.elevated : 'transparent',
            },
            inputProps.style
          ]}
          placeholderTextColor={theme.colors.text.secondary}
        />
        
        {rightIcon && (
          <GluestackInputSlot pr="$3" onPress={onRightIconPress}>
            <GluestackInputIcon as={rightIcon} />
          </GluestackInputSlot>
        )}
      </GluestackInput>
      
      {helperText && !hasError && (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}
      
      {hasError && error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
});