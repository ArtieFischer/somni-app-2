import React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmail, SignUpSchema, SignUpData } from '../../../api/auth';
import { Text, Button } from '@components/atoms';
import AuthInput from '../../../components/ui/AuthInput';
import { useTranslation } from '@hooks/useTranslation';
import { useStyles } from './SignUpScreen.styles';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { t } = useTranslation('auth');
  const styles = useStyles();
  
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
        t('signUp.success'),
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SignIn'),
          },
        ]
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
        <Text variant="h1" style={styles.title}>
          {t('signUp.title')}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {t('signUp.subtitle')}
        </Text>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('signUp.username')}
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
            <AuthInput
              label={t('signUp.email')}
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
              label={t('signUp.password')}
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
          {t('signUp.button')}
        </Button>
        
        <Button
          variant="ghost"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.linkButton}
        >
          {t('signUp.hasAccount')} {t('signUp.signIn')}
        </Button>
      </View>
    </SafeAreaView>
  );
};