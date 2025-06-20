import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Alert,
  ViewStyle,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Text, Button } from '../../components/atoms';
import { StepIndicator } from './components/StepIndicator';
import { StepCredentials } from './steps/StepCredentials';
import { StepPersonalInfo } from './steps/StepPersonalInfo';
import { StepDreamInterpreter } from './steps/StepDreamInterpreter';
import { StepPreferences } from './steps/StepPreferences';
import { StepReview } from './steps/StepReview';
import { signUpWithEmail } from '../../api/auth';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '@somni/stores';
import type { DreamInterpreter } from '@somni/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OnboardingData {
  // Step 1: Credentials
  email: string;
  password: string;
  username: string;
  // Step 2: Personal Info
  display_name: string;
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth: string;
  language: 'en';
  avatar_url?: string;
  avatarFile?: any; // For local file before upload
  // Step 3: Dream Interpreter
  dream_interpreter: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  // Step 4: Preferences
  improve_sleep_quality: 'yes' | 'no' | 'not_sure';
  interested_in_lucid_dreaming: 'yes' | 'no' | 'dont_know_yet';
}

interface OnboardingScreenProps {
  navigation: any;
}

const TOTAL_STEPS = 5;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const scrollViewRef = useRef<ScrollView>(null);
  const { setUser } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    language: 'en', // Default language
  });

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollViewRef.current?.scrollTo({ x: (step - 1) * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const uploadAvatar = async (userId: string, file: any): Promise<string | null> => {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Convert URI to blob for React Native
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.username) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create auth user
      const authData = await signUpWithEmail({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (!authData) throw new Error('No authentication data returned');
      
      // Handle unconfirmed user case (email confirmation required)
      if (!authData.session && authData.user) {
        Alert.alert(
          t('auth:emailConfirmation.title'),
          t('auth:emailConfirmation.message'),
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
        return;
      }
      
      if (!authData.user) throw new Error('No user data returned');

      // 2. Upload avatar if provided
      let avatarUrl = null;
      if (formData.avatarFile) {
        avatarUrl = await uploadAvatar(authData.user.id, formData.avatarFile);
      }

      // 3. Update user profile with all the new fields
      const { error: profileError } = await supabase
        .from('users_profile')
        .update({
          display_name: formData.display_name,
          sex: formData.sex,
          date_of_birth: formData.date_of_birth,
          language: formData.language,
          avatar_url: avatarUrl,
          dream_interpreter: formData.dream_interpreter,
          improve_sleep_quality: formData.improve_sleep_quality,
          interested_in_lucid_dreaming: formData.interested_in_lucid_dreaming,
          onboarding_completed: true,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 4. Update auth store
      setUser(authData.user);

      // 5. Navigate to main app
      Alert.alert(
        'Welcome!',
        'Your account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            }),
          },
        ]
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
    header: {
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.small,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
    },
    stepContainer: {
      width: SCREEN_WIDTH,
      paddingHorizontal: theme.spacing.large,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background.secondary,
    },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepCredentials
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            navigation={navigation}
          />
        );
      case 2:
        return (
          <StepPersonalInfo
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <StepDreamInterpreter
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <StepPreferences
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <StepReview
            data={formData}
            onUpdate={updateFormData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={{ textAlign: 'center', marginBottom: theme.spacing.medium }}>
          Create Your Account
        </Text>
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.content}>
          {renderStep()}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingScreen;