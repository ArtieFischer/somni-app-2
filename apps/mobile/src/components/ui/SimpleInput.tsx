import React, { forwardRef } from 'react';
import {
  Input as GluestackInput,
  InputField,
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

export interface SimpleInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
}

export const SimpleInput = forwardRef<any, SimpleInputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  ...inputProps
}, ref) => {
  const hasError = isInvalid || !!error;

  // If no label, error, or helperText, just return the input
  if (!label && !error && !helperText) {
    return (
      <GluestackInput size={size} isDisabled={isDisabled} isInvalid={hasError}>
        <InputField
          ref={ref}
          {...inputProps}
        />
      </GluestackInput>
    );
  }

  // Otherwise, wrap in FormControl
  return (
    <FormControl 
      isRequired={isRequired} 
      isInvalid={hasError} 
      isDisabled={isDisabled}
      size={size}
    >
      {label && (
        <FormControlLabel>
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      
      <GluestackInput size={size}>
        <InputField
          ref={ref}
          {...inputProps}
        />
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