import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmail, SignUpSchema, SignUpData } from '../api/auth';
import AuthInput from '../components/ui/AuthInput';
import Button from '../components/ui/Button';

// Assuming you have navigation prop from AuthNavigator
export default function SignUpScreen({ navigation }: { navigation: any }) {
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
      // A confirmation message is shown by Supabase by default
      // You might navigate away or show a "Check your email" message
      Alert.alert("Success", "Please check your email to confirm your account.");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label="Username"
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
            placeholder="********"
            secureTextEntry
          />
        )}
      />

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} />

       <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
       </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 32 },
  linkText: { color: '#8A2BE2', textAlign: 'center', marginTop: 24 }
});