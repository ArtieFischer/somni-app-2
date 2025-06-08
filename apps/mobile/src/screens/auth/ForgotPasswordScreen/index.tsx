import React from 'react';
import { SafeAreaView, View, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';
import { AuthInput } from '../../../components/molecules/AuthInput';
import { Button, Text } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';

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
        <Text variant="h2" style={styles.title}>
          Reset Password
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              label="Email"
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
        >
          Send Reset Link
        </Button>
        <View style={{ marginTop: 16 }}>
          <Button variant="ghost" onPress={() => navigation.goBack()}>
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
  title: { textAlign: 'center', marginBottom: 24 },
});
