import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail, SignInSchema, SignInData } from '../../../api/auth';
import { Text, Button } from '../../../components/atoms';
import { Input } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';
import { useTheme } from '../../../hooks/useTheme';
import SomniLogo from '../../../../../../assets/logo_somni_full.svg';
import { DreamyBackground } from '../../../components/DreamyRecordKit';

interface SignInScreenProps {
  navigation: any;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const { saveCredentials, attemptBiometricSignIn, getSavedCredentials } =
    useBiometricAuth();
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  const styles = StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.large,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginVertical: theme.spacing.medium,
    },
    biometricContainer: {
      marginTop: theme.spacing.medium,
    },
    linkContainer: {
      marginTop: theme.spacing.medium,
      alignItems: 'center',
    },
  });

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
        Alert.alert(t('signIn.error.invalidCredentials') as string, error.message);
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
    <View style={styles.fullScreenContainer}>
      <DreamyBackground active={true} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SomniLogo width={280} height={93} />
        </View>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {String(t('signIn.subtitle'))}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('signIn.email'))}
              size="md"
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
            <Input
              label={String(t('signIn.password'))}
              size="md"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              placeholder="********"
              secureTextEntry
            />
          )}
        />

        <View style={[styles.forgotPasswordContainer, { marginTop: theme.spacing.small }]}>
          <Button 
            variant="link" 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            {String(t('signIn.forgotPassword'))}
          </Button>
        </View>

        <Button
          variant="solid"
          action="primary"
          size="md"
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
        >
          {String(t('signIn.button'))}
        </Button>

        {canUseBiometrics && (
          <View style={styles.biometricContainer}>
            <Button 
              variant="outline" 
              action="secondary" 
              size="md" 
              onPress={onBiometricPress}
            >
              Use Face ID / Touch ID
            </Button>
          </View>
        )}

        <View style={styles.linkContainer}>
          <Button variant="link" onPress={() => navigation.navigate('SignUp')}>
            {String(t('signIn.noAccount'))} {String(t('signIn.signUp'))}
          </Button>
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
