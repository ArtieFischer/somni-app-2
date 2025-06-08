import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingSleepScheduleScreen } from '../screens/onboarding/OnboardingSleepScheduleScreen';
import { OnboardingGoalsScreen } from '../screens/onboarding/OnboardingGoalsScreen';
import { OnboardingLucidityScreen } from '../screens/onboarding/OnboardingLucidityScreen';
import { OnboardingPrivacyScreen } from '../screens/onboarding/OnboardingPrivacyScreen';
import { OnboardingCompleteScreen } from '../screens/onboarding/OnboardingCompleteScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcomeScreen}
      />
      <Stack.Screen
        name="OnboardingSleepSchedule"
        component={OnboardingSleepScheduleScreen}
      />
      <Stack.Screen
        name="OnboardingGoalsScreen"
        component={OnboardingGoalsScreen}
      />
      <Stack.Screen
        name="OnboardingLucidityScreen"
        component={OnboardingLucidityScreen}
      />
      <Stack.Screen
        name="OnboardingPrivacyScreen"
        component={OnboardingPrivacyScreen}
      />
      <Stack.Screen
        name="OnboardingCompleteScreen"
        component={OnboardingCompleteScreen}
      />
    </Stack.Navigator>
  );
}
