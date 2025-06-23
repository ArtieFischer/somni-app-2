import React from 'react';
import { SafeAreaView, View, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';
import { Input } from '../../../components/ui';
import { Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import SomniLogo from '../../../../../../assets/logo_somni_full.svg';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check your email', 'A password reset link has been sent.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SomniLogo width={260} height={87} />
        </View>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
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
        <Button
          variant="solid"
          size="md"
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          style={{ marginTop: theme.spacing.medium }}
        >
          Send Reset Link
        </Button>
        <View style={{ marginTop: theme.spacing.medium }}>
          <Button variant="link" onPress={() => navigation.goBack()}>
            Back to Sign In
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  title: { textAlign: 'center', marginBottom: 24 },
});
