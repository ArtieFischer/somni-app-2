import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail, SignInSchema, SignInData } from '../../../api/auth';
import { Text, Button } from '@components/atoms';
import AuthInput from '../../../components/ui/AuthInput';
import { useTranslation } from '@hooks/useTranslation';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';
import { useStyles } from './SignInScreen.styles';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { t } = useTranslation('auth');
  const styles = useStyles();
  const { saveCredentials, attemptBiometricSignIn, isBiometricAvailable } = useBiometricAuth();
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
  });

  useEffect(() => {
    // Check if biometric authentication is available and has saved credentials
    const checkBiometricAvailability = async () => {
      const isAvailable = await isBiometricAvailable();
      setShowBiometricButton(isAvailable);
    };
    
    checkBiometricAvailability();
  }, [isBiometricAvailable]);

  const onSubmit = async (data: SignInData) => {
    try {
      await signInWithEmail(data);
      // On success, save credentials for biometric login
      await saveCredentials(data.email, data.password);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t('signIn.error.invalidCredentials'), error.message);
      }
    }
  };

  const onBiometricPress = async () => {
    try {
      const result = await attemptBiometricSignIn();
      if (!result.success) {
        Alert.alert('Biometric Sign In Failed', result.error || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Biometric Sign In Failed', 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {t('signIn.title')}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {t('signIn.subtitle')}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('signIn.email')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('signIn.password')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              placeholder="********"
              secureTextEntry
            />
          )}
        />

        <Button
          variant="ghost"
          size="small"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordButton}
        >
          {t('signIn.forgotPassword')}
        </Button>

        <Button 
          variant="primary" 
          size="large"
          onPress={handleSubmit(onSubmit)} 
          loading={isSubmitting}
          style={styles.button}
        >
          {t('signIn.button')}
        </Button>

        {showBiometricButton && (
          <Button
            variant="secondary"
            size="large"
            onPress={onBiometricPress}
            style={styles.biometricButton}
          >
            Use Face ID / Touch ID
          </Button>
        )}
        
        <Button
          variant="ghost"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.linkButton}
        >
          {t('signIn.noAccount')} {t('signIn.signUp')}
        </Button>
      </View>
    </SafeAreaView>
  );
};