import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { signInWithEmail } from '../api/auth';

const CREDENTIALS_KEY = 'somniUserCredentials';

export const useBiometricAuth = () => {
  const saveCredentials = async (email: string, password: string) => {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ email, password }));
  };

  const attemptBiometricSignIn = async () => {
    try {
      const isSupported = await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
      if (!isSupported) return { success: false, error: 'Biometrics not available.' };

      const authResult = await LocalAuthentication.authenticateAsync({ 
        promptMessage: 'Sign in to Somni' 
      });

      if (authResult.success) {
        const creds = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (creds) {
          const { email, password } = JSON.parse(creds);
          await signInWithEmail({ email, password });
          return { success: true };
        }
      }
      return { success: false, error: 'Authentication cancelled.' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  };

  const getSavedCredentials = async () => {
    const creds = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return !!creds;
  };

  return { saveCredentials, attemptBiometricSignIn, getSavedCredentials };
}; 