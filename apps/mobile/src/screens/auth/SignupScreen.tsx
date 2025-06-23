import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Text, Button, Input } from '../../components/atoms';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '@somni/stores';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username can be at most 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const { setSession } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    try {
      const fieldSchema = SignupSchema.shape[field as keyof typeof SignupSchema.shape];
      fieldSchema.parse(value);
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const validation = SignupSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user with minimal data
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.username,
            handle: formData.username,
          },
          emailRedirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
        },
      });
      
      if (signupError) throw signupError;
      if (!authData?.user) throw new Error('No user data returned');

      // Show confirmation message
      Alert.alert(
        t('emailConfirmation.title'),
        t('emailConfirmation.message'),
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('SignIn') 
        }]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Sign Up Error',
        error instanceof Error ? error.message : 'An error occurred during sign up'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.large,
    },
    header: {
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.medium,
    },
    inputContainer: {
      marginBottom: theme.spacing.small,
    },
    error: {
      color: theme.colors.status.error,
      fontSize: theme.typography.caption.fontSize,
      marginTop: theme.spacing.xs,
    },
    footer: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
    },
    signInLink: {
      flexDirection: 'row',
      marginTop: theme.spacing.medium,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="h1" style={{ textAlign: 'center' }}>
                {t('signup.title')}
              </Text>
              <Text 
                variant="body" 
                style={{ 
                  textAlign: 'center', 
                  marginTop: theme.spacing.small,
                  color: theme.colors.text.secondary 
                }}
              >
                {t('signup.subtitle')}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Input
                  label={t('signup.username')}
                  value={formData.username}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, username: value }));
                    validateField('username', value);
                  }}
                  placeholder={t('signup.usernamePlaceholder')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.username}
                />
                {errors.username && (
                  <Text style={styles.error}>{errors.username}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label={t('signup.email')}
                  value={formData.email}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, email: value }));
                    validateField('email', value);
                  }}
                  placeholder={t('signup.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.email}
                />
                {errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label={t('signup.password')}
                  value={formData.password}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, password: value }));
                    validateField('password', value);
                  }}
                  placeholder={t('signup.passwordPlaceholder')}
                  secureTextEntry
                  error={!!errors.password}
                />
                {errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}
              </View>

              <Button
                onPress={handleSubmit}
                disabled={isSubmitting || !formData.email || !formData.password || !formData.username}
                loading={isSubmitting}
                style={{ marginTop: theme.spacing.medium }}
              >
                {t('signup.createAccount')}
              </Button>
            </View>

            <View style={styles.footer}>
              <View style={styles.signInLink}>
                <Text variant="body" style={{ color: theme.colors.text.secondary }}>
                  {t('signup.alreadyHaveAccount')} 
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text variant="body" style={{ color: theme.colors.primary.main }}>
                    {t('signup.signIn')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;