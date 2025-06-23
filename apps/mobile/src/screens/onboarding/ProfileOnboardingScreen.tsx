import React, { useState, useRef, useEffect } from 'react';
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
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Text, Button } from '../../components/atoms';
import { StepIndicator } from './components/StepIndicator';
import { StepPersonalInfo } from './steps/StepPersonalInfo';
import { StepDreamInterpreter } from './steps/StepDreamInterpreter';
import { StepPreferences } from './steps/StepPreferences';
import { StepSleepSchedule } from './steps/StepSleepSchedule';
import { StepLucidExperience } from './steps/StepLucidExperience';
import { StepLocation } from './steps/StepLocation';
import { StepReview } from './steps/StepReview';
import { supabase } from '../../lib/supabase';
import { useAuthStore, useOnboardingStore } from '@somni/stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ProfileOnboardingData {
  // Personal Info
  username?: string;
  sex: 'male' | 'female' | 'other' | 'unspecified';
  birth_date: string;
  locale: string;
  avatar_url?: string;
  avatarFile?: any;
  // Dream Interpreter
  dream_interpreter: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  // Preferences
  improve_sleep_quality: 'yes' | 'no' | 'not_sure';
  interested_in_lucid_dreaming: 'yes' | 'no' | 'dont_know_yet';
  // Sleep Schedule (conditional)
  bedTime?: string;
  wakeTime?: string;
  // Lucid Experience (conditional)
  lucidDreamingExperience?: string;
  // Location
  locationMethod?: 'auto' | 'manual' | 'skip';
  location?: { latitude: number; longitude: number };
  manualLocation?: string;
  locationDisplay?: string;
  locationCity?: string;
  locationCountry?: string;
}

interface ProfileOnboardingScreenProps {
  navigation: any;
}

type StepType = 'profile' | 'guide' | 'goals' | 'sleepSchedule' | 'lucidExperience' | 'location' | 'review';

export const ProfileOnboardingScreen: React.FC<ProfileOnboardingScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);
  const { user, setProfile } = useAuthStore();
  const { data: onboardingData, updateData: updateOnboardingData, reset: resetOnboardingStore } = useOnboardingStore();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileOnboardingData>>({
    locale: 'en',
    sex: 'unspecified',
    ...onboardingData, // Initialize with data from global store
  });

  // Fetch user's email and handle from auth
  const [userEmail, setUserEmail] = useState('');
  const [userHandle, setUserHandle] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        setUserEmail(user.email || '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('handle')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setUserHandle(profile.handle);
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Define the steps - some are conditional
  const getSteps = (): StepType[] => {
    const steps: StepType[] = ['profile', 'guide', 'goals'];
    
    // Add sleep schedule if they want to improve sleep quality or not sure
    if (formData.improve_sleep_quality === 'yes' || formData.improve_sleep_quality === 'not_sure') {
      steps.push('sleepSchedule');
    }
    
    // Add lucid experience if they're interested or not sure
    if (formData.interested_in_lucid_dreaming === 'yes' || formData.interested_in_lucid_dreaming === 'dont_know_yet') {
      steps.push('lucidExperience');
    }
    
    steps.push('location', 'review');
    return steps;
  };

  const steps = getSteps();
  const currentStep = steps[currentStepIndex];
  // Fixed: total steps should always be 5 (the main steps)
  const totalSteps = 5; // profile, guide, goals, location, review

  const updateFormData = (data: Partial<ProfileOnboardingData>) => {
    console.log('=== DEBUG: ProfileOnboardingScreen - updateFormData ===');
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Current formData before update:', JSON.stringify(formData, null, 2));
    setFormData(prev => {
      const updated = { ...prev, ...data };
      console.log('Updated formData:', JSON.stringify(updated, null, 2));
      return updated;
    });
    // Also update the global onboarding store
    updateOnboardingData(data);
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      goToStep(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(prevIndex);
    }
  };

  const uploadAvatar = async (userId: string, file: any): Promise<string | null> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session for avatar upload');
        return null;
      }

      console.log('Uploading avatar from:', file.uri);

      // 1. Read the file as base-64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length < 100) {
        throw new Error('Selected image looks empty — aborting upload');
      }

      console.log('Base64 length:', base64.length);

      // 2. Convert to ArrayBuffer (works on RN)
      const arrayBuffer = decode(base64);

      // 3. Build a file path
      const fileName = `avatar_${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;
      console.log('To path:', filePath);

      // 4. Upload the avatar
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600',
        });

      if (error) {
        console.error('Avatar upload error details:', error);
        throw error;
      }

      // 5. Get the public URL
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Avatar uploaded successfully:', publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User session not found');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload avatar if provided
      let avatarUrl = formData.avatar_url;
      if (formData.avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id, formData.avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // Prepare location data
      let locationData: any = {};
      if (formData.locationMethod === 'auto' && formData.location) {
        locationData = {
          location: `POINT(${formData.location.longitude} ${formData.location.latitude})`,
          location_accuracy: 'exact',
          location_city: formData.locationCity,
          location_country: formData.locationCountry,
        };
      } else if (formData.locationMethod === 'manual' && formData.manualLocation) {
        locationData = {
          location_city: formData.manualLocation,
          location_accuracy: 'city',
        };
      }

      // Clean data before sending to database
      const cleanData = {
        username: formData.username || null,
        sex: formData.sex || 'unspecified',
        birth_date: formData.birth_date && formData.birth_date !== '' ? formData.birth_date : null,
        locale: formData.locale || 'en',
        avatar_url: avatarUrl || null,
        dream_interpreter: formData.dream_interpreter || null,
        onboarding_complete: true,
        ...locationData,
        settings: {
          location_sharing: formData.locationMethod === 'skip' ? 'none' : formData.locationMethod,
          sleep_schedule: formData.bedTime && formData.wakeTime ? {
            bed: formData.bedTime,
            wake: formData.wakeTime,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          } : null,
          improve_sleep_quality: formData.improve_sleep_quality === 'yes',
          interested_in_lucid_dreaming: formData.interested_in_lucid_dreaming === 'yes',
          lucid_dreaming_experience: formData.lucidDreamingExperience || null,
        },
      };

      console.log('=== DEBUG: ProfileOnboardingScreen - handleSubmit ===');
      console.log('Final formData:', JSON.stringify(formData, null, 2));
      console.log('Clean data to be saved:', JSON.stringify(cleanData, null, 2));
      console.log('User ID:', user.id);

      // Update profile with all collected data
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('=== DEBUG: Profile Update Success ===');
      console.log('Updated profile:', JSON.stringify(profile, null, 2));

      // Update auth store
      if (profile) {
        setProfile(profile);
      }

      // Clean up the temporary onboarding store
      resetOnboardingStore();

      // Profile update successful - AppNavigator will handle navigation
      Alert.alert(
        'Welcome!',
        'Your profile has been set up successfully.',
        [
          {
            text: 'OK',
          },
        ]
      );
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error?.code === '22007') {
        errorMessage = 'Invalid date format. Please check your birth date.';
      } else if (error?.message?.includes('row-level security')) {
        errorMessage = 'Authorization error. Please try logging in again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <StepPersonalInfo
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={() => {}}
          />
        );
      case 'guide':
        return (
          <StepDreamInterpreter
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'goals':
        return (
          <StepPreferences
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'sleepSchedule':
        return (
          <StepSleepSchedule
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'lucidExperience':
        return (
          <StepLucidExperience
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'location':
        return (
          <StepLocation
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 'review':
        return (
          <StepReview
            data={{ ...formData, email: userEmail, handle: userHandle }}
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

  // Calculate current step number for indicator
  const getCurrentStepNumber = () => {
    // Map each step type to its position in the main flow
    const stepMapping: Record<string, number> = {
      'profile': 1,
      'guide': 2,
      'goals': 3,
      'sleepSchedule': 3, // Part of goals/preferences
      'lucidExperience': 3, // Part of goals/preferences  
      'location': 4,
      'review': 5
    };
    return stepMapping[currentStep] || 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={{ textAlign: 'center', marginBottom: theme.spacing.medium }}>
          {t('profileSetup.title') as string}
        </Text>
        <StepIndicator currentStep={getCurrentStepNumber()} totalSteps={totalSteps} currentStepKey={currentStep} />
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

export default ProfileOnboardingScreen;