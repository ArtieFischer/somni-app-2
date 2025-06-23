import React, { useState } from 'react';
import {
  Input as GluestackInput,
  InputField,
  InputSlot,
  InputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from '@gluestack-ui/themed';

export interface InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'outline' | 'underlined' | 'rounded';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  type?: 'text' | 'password';
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  label,
  helperText,
  error,
  variant = 'outline',
  size = 'md',
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  isRequired = false,
  type = 'text',
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password' || secureTextEntry;

  return (
    <FormControl
      size={size}
      isDisabled={isDisabled}
      isInvalid={!!error || isInvalid}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
    >
      {label && (
        <FormControlLabel mb="$1">
          <FormControlLabelText color="$textLight200" size="sm" fontWeight="$medium">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
      )}
      
      <GluestackInput 
        variant={variant} 
        size={size}
        bg="$backgroundLight950"
        borderColor="$borderLight300"
        sx={{
          ':focus': {
            borderColor: '$primary500',
            borderWidth: 2,
          },
          '_focus': {
            borderColor: '$primary500',
            borderWidth: 2,
          },
        }}
      >
        {leftIcon && (
          <InputSlot pl="$3">
            <InputIcon as={leftIcon} />
          </InputSlot>
        )}
        
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          type={isPasswordField && !showPassword ? 'password' : 'text'}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          color="$textLight50"
          placeholderTextColor="$textLight500"
          {...props}
        />
        
        {isPasswordField && (
          <InputSlot pr="$3" onPress={() => setShowPassword(!showPassword)}>
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              color="$textLight400"
            />
          </InputSlot>
        )}
        
        {rightIcon && !isPasswordField && (
          <InputSlot pr="$3" onPress={onRightIconPress}>
            <InputIcon as={rightIcon} />
          </InputSlot>
        )}
      </GluestackInput>
      
      {helperText && !error && (
        <FormControlHelper>
          <FormControlHelperText color="$textLight400" size="xs">
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      )}
      
      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText color="$error400" size="xs">
            {error}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};