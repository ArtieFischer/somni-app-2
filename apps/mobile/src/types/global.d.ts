// Global type declarations

// Augment the Input component from Gluestack to accept boolean error prop
declare module '@gluestack-ui/themed' {
  interface InputFieldProps {
    error?: boolean | string;
    value?: string | boolean;
  }
}

// Augment custom Input component to accept boolean error
declare module '../components/ui' {
  interface InputProps {
    error?: string | boolean;
  }
}

// Fix SignupScreen import issue
declare module '../screens/SignUpScreen' {
  const SignupScreen: React.FC<any>;
  export default SignupScreen;
}