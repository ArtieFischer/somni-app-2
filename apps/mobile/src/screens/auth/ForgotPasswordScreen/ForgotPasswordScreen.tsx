import React from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';
import { Text, Button } from '@components/atoms';
import AuthInput from '../../../components/ui/AuthInput';
import { useTranslation } from '@hooks/useTranslation';
import { useStyles } from './ForgotPasswordScreen.styles';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation('auth');
  const styles = useStyles();
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL || 'somni://auth/callback',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          t('forgotPassword.success'),
          'Password reset link sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {t('forgotPassword.title')}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {t('forgotPassword.subtitle')}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label={t('forgotPassword.email')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              placeholder="you@example.com"
              keyboardType="email-address"
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
          {t('forgotPassword.button')}
        </Button>
        
        <Button 
          variant="ghost" 
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
        >
          {t('forgotPassword.backToSignIn')}
        </Button>
      </View>
    </SafeAreaView>
  );
};