import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@somni/types';
import { useTheme } from '../hooks/useTheme';
import MainNavigator from './MainNavigator';
import { DreamDetailScreen } from '../screens/dream/DreamDetailScreen';
import { Dream } from '@somni/types';
import { useDreamStore } from '@somni/stores';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  const theme = useTheme();
  const { getDreamById } = useDreamStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DreamDetail"
        options={{ 
          title: 'Dream Analysis',
          presentation: 'modal',
          headerShown: false,
        }}
      >
        {({ route }) => {
          const dream = getDreamById(route.params.dreamId);
          
          if (!dream) {
            // TODO: Handle dream not found
            return null;
          }

          // Convert Dream to DreamDetailData format
          const dreamData = {
            title: dream.rawTranscript.slice(0, 50) + '...',
            date: new Date(dream.recordedAt).toLocaleString(),
            dreamTopic: dream.rawTranscript,
            symbols: dream.tags || [],
            quickTake: 'Analysis pending...', // This would come from AI analysis
            dreamWork: 'Analysis pending...', // This would come from AI analysis
            interpretation: 'Analysis pending...', // This would come from AI analysis
            selfReflection: 'What aspects of this dream resonate with your current life situation?',
          };

          return <DreamDetailScreen dreamData={dreamData} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}