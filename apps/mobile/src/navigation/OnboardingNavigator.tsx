import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileOnboardingScreen } from '../screens/onboarding/ProfileOnboardingScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false 
      }}
    >
      <Stack.Screen
        name="ProfileOnboarding"
        component={ProfileOnboardingScreen}
      />
    </Stack.Navigator>
  );
}
