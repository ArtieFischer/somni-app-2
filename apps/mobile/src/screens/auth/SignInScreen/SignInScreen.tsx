import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail, SignInSchema, SignInData } from '../../../api/auth';
import { Text, Button } from '../../../components/atoms';
import { AuthInput } from '../../../components/molecules/AuthInput';
import { useTranslation } from '../../../hooks/useTranslation';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';
import { useStyles } from './SignInScreen.styles';

interface SignInScreenProps {
  navigation: any;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const styles = useStyles();
  const { saveCredentials, attemptBiometricSignIn, getSavedCredentials } =
    useBiometricAuth();
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
  });

  useEffect(() => {
    getSavedCredentials().then(setCanUseBiometrics);
  }, []);

  const onSubmit = async (data: SignInData) => {
    try {
      await signInWithEmail(data);
      await saveCredentials(data.email, data.password); // Save on success
      // Navigation will be handled by auth state change
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t('signIn.error.invalidCredentials'), error.message);
      }
    }
  };

  const onBiometricPress = async () => {
    const result = await attemptBiometricSignIn();
    if (!result.success) {
      Alert.alert('Sign In Failed', result.error || 'Authentication failed');
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

        <View style={{ alignSelf: 'flex-end', marginVertical: 8 }}>
          <Button
            variant="ghost"
            size="small"
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            Forgot Password?
          </Button>
        </View>

        <Button
          variant="primary"
          size="large"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.button}
        >
          {t('signIn.button')}
        </Button>

        {canUseBiometrics && (
          <View style={{ marginTop: 16 }}>
            <Button variant="secondary" size="large" onPress={onBiometricPress}>
              Use Face ID / Touch ID
            </Button>
          </View>
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
