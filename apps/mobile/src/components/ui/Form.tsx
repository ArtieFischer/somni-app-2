import React from 'react';
import {
  FormControl as GluestackFormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { AlertCircleIcon } from '@gluestack-ui/themed';

export interface FormControlProps {
  children: React.ReactNode;
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FormControl: React.FC<FormControlProps> = ({
  children,
  label,
  helperText,
  error,
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  size = 'md',
}) => {
  const hasError = isInvalid || !!error;

  return (
    <GluestackFormControl
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
      
      {children}
      
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
    </GluestackFormControl>
  );
};