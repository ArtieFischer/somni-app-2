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
  sex: 'male' | 'female' | 'other' | 'unspecified';
  birth_date: string;
  locale: string;
  avatar_url?: string;
  avatarFile?: any; // For local file before upload
  // Step 3: Dream Interpreter
  dream_interpreter: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  // Step 4: Preferences
  improve_sleep_quality: 'yes' | 'no' | 'not_sure';
  interested_in_lucid_dreaming: 'yes' | 'no' | 'dont_know_yet';
  // Backward compatibility fields (deprecated, use above)
  display_name?: string;
  date_of_birth?: string;
  language?: string;
}

interface OnboardingScreenProps {
  navigation: any;
}

const TOTAL_STEPS = 5;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const scrollViewRef = useRef<ScrollView>(null);
  const { setSession } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    locale: 'en', // Default locale
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
    console.log('=== DEBUG: handleSubmit called ===');
    console.log('Checking required fields...');
    console.log('Email:', formData.email);
    console.log('Password:', formData.password ? '[SET]' : '[NOT SET]');
    console.log('Username:', formData.username);
    
    if (!formData.email || !formData.password || !formData.username) {
      console.log('ERROR: Missing required fields!');
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    console.log('All required fields present, proceeding with signup...');
    setIsSubmitting(true);
    try {
      // 1. Create auth user
      console.log('Calling signUpWithEmail...');
      // We'll pass additional data that the trigger can use
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.username,
            handle: formData.username,
            sex: formData.sex,
            birth_date: formData.birth_date,
            locale: formData.locale,
            dream_interpreter: formData.dream_interpreter,
            improve_sleep_quality: formData.improve_sleep_quality === 'yes',
            interested_in_lucid_dreaming: formData.interested_in_lucid_dreaming === 'yes',
          },
          emailRedirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
        },
      });
      
      if (signupError) throw signupError;
      
      console.log('Auth data received:', JSON.stringify({
        user: authData?.user?.id,
        session: !!authData?.session,
        email: authData?.user?.email
      }, null, 2));

      if (!authData) throw new Error('No authentication data returned');
      
      if (!authData.user) throw new Error('No user data returned');
      
      // We have a user, proceed with profile update regardless of session status
      console.log('User created, updating profile...');

      // DEBUG: Show formData to see what we're working with
      console.log('=== DEBUG: OnboardingScreen - Final FormData ===');
      console.log(JSON.stringify({
        sex: formData.sex,
        birth_date: formData.birth_date,
        locale: formData.locale,
        dream_interpreter: formData.dream_interpreter,
        username: formData.username,
        has_avatar: !!formData.avatarFile
      }, null, 2));
      console.log('Full formData:', JSON.stringify(formData, null, 2));
      console.log('===============================================');

      // 2. Avatar upload will be handled after email confirmation
      // The profile has been created by the trigger with all the data we passed
      console.log('Profile created by trigger with signup metadata');
      
      // TODO: Avatar upload needs to be done after email confirmation
      // when the user has a valid session

      // 4. Update auth store
      if (authData.session) {
        setSession(authData.session);
      }

      // 5. Check if email confirmation is required
      if (!authData.session && authData.user) {
        console.log('Email confirmation required, showing alert...');
        Alert.alert(
          t('auth:emailConfirmation.title'),
          t('auth:emailConfirmation.message'),
          [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
        );
      } else {
        // Account created successfully - AppNavigator will handle navigation
        Alert.alert(
          'Welcome!',
          'Your account has been created successfully.',
          [
            {
              text: 'OK',
            },
          ]
        );
      }
    } catch (error) {
      console.log('=== DEBUG: Signup error caught ===');
      console.error('Signup error:', error);
      console.log('Error type:', typeof error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      console.log('================================');
      
      Alert.alert(
        'Sign Up Error',
        error instanceof Error ? error.message : 'An error occurred during sign up'
      );
    } finally {
      console.log('=== DEBUG: Finally block, setting isSubmitting to false ===');
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