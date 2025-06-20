import React from 'react';
import { TextInputProps } from 'react-native';
import { Input } from '../../ui';

export interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <Input
      label={label}
      error={error}
      variant="filled"
      size="lg"
      {...props}
    />
  );
};

