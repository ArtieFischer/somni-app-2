import React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail, SignInSchema, SignInData } from '../../../api/auth';
import { Text, Button } from '@components/atoms';
import AuthInput from '../../../components/ui/AuthInput';
import { useTranslation } from '@hooks/useTranslation';
import { useStyles } from './SignInScreen.styles';

interface SignInScreenProps {
  navigation: any;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('auth');
  const styles = useStyles();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInData) => {
    try {
      await signInWithEmail(data);
      // Navigation will be handled by auth state change
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t('signIn.error.invalidCredentials'), error.message);
      }
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
          variant="primary" 
          size="large"
          onPress={handleSubmit(onSubmit)} 
          loading={isSubmitting}
          style={styles.button}
        >
          {t('signIn.button')}
        </Button>
        
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