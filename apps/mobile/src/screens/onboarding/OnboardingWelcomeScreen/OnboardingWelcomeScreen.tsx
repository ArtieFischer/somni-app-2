import React from 'react';
import { View } from 'react-native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { useStyles } from './OnboardingWelcomeScreen.styles';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

interface OnboardingWelcomeScreenProps {}

export const OnboardingWelcomeScreen: React.FC<
  OnboardingWelcomeScreenProps
> = () => {
  const navigation = useNavigation<any>();
  const styles = useStyles();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const handleNext = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('onboarding.permissions.title', 'Permissions Recommended'),
          t(
            'onboarding.permissions.message',
            'We recommend enabling notifications for features like reality checks.',
          ),
        );
      }
      
      // Check if user wants to improve sleep quality
      if (profile?.improve_sleep_quality === 'yes' || profile?.improve_sleep_quality === 'not_sure') {
        navigation.navigate('OnboardingSleepSchedule');
      } else if (profile?.interested_in_lucid_dreaming === 'yes' || profile?.interested_in_lucid_dreaming === 'dont_know_yet') {
        navigation.navigate('OnboardingLucidityScreen');
      } else {
        navigation.navigate('OnboardingCompleteScreen');
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      // Same navigation logic as above
      if (profile?.improve_sleep_quality === 'yes' || profile?.improve_sleep_quality === 'not_sure') {
        navigation.navigate('OnboardingSleepSchedule');
      } else if (profile?.interested_in_lucid_dreaming === 'yes' || profile?.interested_in_lucid_dreaming === 'dont_know_yet') {
        navigation.navigate('OnboardingLucidityScreen');
      } else {
        navigation.navigate('OnboardingCompleteScreen');
      }
    }
  };

  return (
    <OnboardingScreenLayout
      title={t('onboarding.welcome.title', 'Welcome to Somni')}
      description={t(
        'onboarding.welcome.description',
        "Before we begin, let's set up a few things to personalize your dream journey.",
      )}
      onNext={handleNext}
    >
      <View style={styles.animationContainer}>
        {/* 
          <LottieView 
            source={require('../../../../assets/animations/your-animation.json')} 
            autoPlay 
            loop 
            style={styles.animation}
          /> 
        */}
      </View>
    </OnboardingScreenLayout>
  );
};
