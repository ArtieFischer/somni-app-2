// Gluestack UI type declarations
declare module '@gluestack-ui/themed' {
  import { ComponentType } from 'react';
  import { ViewProps, TextProps, TextInputProps, PressableProps as RNPressableProps } from 'react-native';
  
  // Core components
  export const Box: ComponentType<ViewProps>;
  export const VStack: ComponentType<ViewProps & { space?: string | number }>;
  export const HStack: ComponentType<ViewProps & { space?: string | number }>;
  export const Heading: ComponentType<TextProps>;
  export const Text: ComponentType<TextProps>;
  export const Image: ComponentType<any>;
  export const Pressable: ComponentType<RNPressableProps>;
  
  // Button components
  export const Button: ComponentType<any>;
  export const ButtonText: ComponentType<TextProps>;
  export const ButtonIcon: ComponentType<any>;
  export const ButtonSpinner: ComponentType<any>;
  export const ButtonGroup: ComponentType<ViewProps>;
  
  // Input components
  export const Input: ComponentType<ViewProps & { variant?: string; size?: string; isDisabled?: boolean }>;
  export const InputField: ComponentType<TextInputProps & InputFieldProps>;
  export const InputSlot: ComponentType<ViewProps>;
  export const InputIcon: ComponentType<{ as: ComponentType<any> }>;
  
  // Form control components
  export const FormControl: ComponentType<{ isRequired?: boolean; isInvalid?: boolean; isDisabled?: boolean; size?: string }>;
  export const FormControlLabel: ComponentType<ViewProps>;
  export const FormControlLabelText: ComponentType<TextProps>;
  export const FormControlHelper: ComponentType<ViewProps>;
  export const FormControlHelperText: ComponentType<TextProps>;
  export const FormControlError: ComponentType<ViewProps>;
  export const FormControlErrorIcon: ComponentType<{ as: ComponentType<any> }>;
  export const FormControlErrorText: ComponentType<TextProps>;
  
  // Modal components
  export const Modal: ComponentType<any>;
  export const ModalBackdrop: ComponentType<any>;
  export const ModalContent: ComponentType<any>;
  export const ModalHeader: ComponentType<any>;
  export const ModalCloseButton: ComponentType<any>;
  export const ModalBody: ComponentType<any>;
  export const ModalFooter: ComponentType<any>;
  
  // Icon components
  export const AlertCircleIcon: ComponentType<any>;
  export const CloseIcon: ComponentType<any>;
  export const CheckIcon: ComponentType<any>;
  export const ChevronLeftIcon: ComponentType<any>;
  export const ChevronRightIcon: ComponentType<any>;
  export const ChevronDownIcon: ComponentType<any>;
  export const ChevronUpIcon: ComponentType<any>;
  export const InfoIcon: ComponentType<any>;
  export const WarningIcon: ComponentType<any>;
  export const CheckCircleIcon: ComponentType<any>;
  export const XCircleIcon: ComponentType<any>;
  
  // Badge components
  export const Badge: ComponentType<any>;
  export const BadgeText: ComponentType<TextProps>;
  
  // Other components
  export const Center: ComponentType<ViewProps>;
  export const Spinner: ComponentType<any>;
  export const Divider: ComponentType<any>;
  export const Avatar: ComponentType<any>;
  export const AvatarImage: ComponentType<any>;
  export const AvatarFallbackText: ComponentType<TextProps>;
  
  // Props interfaces
  export interface InputFieldProps {
    error?: boolean | string;
    value?: string | boolean;
  }
}