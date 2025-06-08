import React from 'react';
import { SafeAreaView, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmail, SignInSchema, SignInData } from '../api/auth';
import AuthInput from '../components/ui/AuthInput';
import Button from '../components/ui/Button';

export default function SignInScreen({ navigation }: { navigation: any }) {
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
      // If successful, the onAuthStateChange listener in our authStore
      // will trigger the navigation to the main app.
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign In Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue your journey.</Text>

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

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} />
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
       </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 32 },
  linkText: { color: '#8A2BE2', textAlign: 'center', marginTop: 24 }
});