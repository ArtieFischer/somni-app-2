import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { signInWithEmail } from '../api/auth';

const SECURE_STORE_KEY = 'userCredentials';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export const useBiometricAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const saveCredentials = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(
        SECURE_STORE_KEY, 
        JSON.stringify({ email, password })
      );
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }, []);

  const isBiometricAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const hasCredentials = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      
      return hasHardware && isEnrolled && !!hasCredentials;
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      return false;
    }
  }, []);

  const attemptBiometricSignIn = useCallback(async (): Promise<BiometricAuthResult> => {
    if (isAuthenticating) {
      return { success: false, error: 'Authentication already in progress' };
    }

    try {
      setIsAuthenticating(true);

      const isSupported = await isBiometricAvailable();
      if (!isSupported) {
        return { 
          success: false, 
          error: 'Biometrics not supported, enrolled, or no saved credentials' 
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Somni',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        const credsString = await SecureStore.getItemAsync(SECURE_STORE_KEY);
        if (credsString) {
          const { email, password } = JSON.parse(credsString);
          await signInWithEmail({ email, password });
          return { success: true };
        } else {
          return { success: false, error: 'No saved credentials found' };
        }
      } else {
        return { 
          success: false, 
          error: result.error === 'user_cancel' ? 'Authentication cancelled' : 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, isBiometricAvailable]);

  const clearSavedCredentials = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }, []);

  return {
    saveCredentials,
    attemptBiometricSignIn,
    isBiometricAvailable,
    clearSavedCredentials,
    isAuthenticating,
  };
};