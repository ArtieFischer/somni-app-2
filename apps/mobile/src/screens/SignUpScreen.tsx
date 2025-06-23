import React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmail, SignUpSchema, SignUpData } from '../api/auth';
import { Text, Button } from '../components/atoms';
import { Input } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';
import { StyleSheet } from 'react-native';
import SomniLogo from '../../../../assets/logo_somni_full.svg';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
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
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpData) => {
    try {
      await signUpWithEmail(data);
      Alert.alert(
        'Success',
        'Please check your email to confirm your account.',
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SomniLogo width={280} height={93} />
        </View>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {String(t('signUp.subtitle'))}
        </Text>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('signUp.username'))}
              size="md"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.username?.message}
              placeholder="Choose a username"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('signUp.email'))}
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
              label={String(t('signUp.password'))}
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

        <Button
          variant="solid"
          action="primary"
          size="md"
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          style={{ marginTop: theme.spacing.medium }}
        >
          {String(t('signUp.button'))}
        </Button>

        <Button 
          variant="link" 
          onPress={() => navigation.navigate('SignIn')}
          style={{ marginTop: theme.spacing.medium }}
        >
          {String(t('signUp.hasAccount'))} {String(t('signUp.signIn'))}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
