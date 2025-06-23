import { InputProps as OriginalInputProps } from '../components/ui/Input';

declare module '../components/ui' {
  export interface InputProps extends Omit<OriginalInputProps, 'error'> {
    error?: string | boolean;
  }
}