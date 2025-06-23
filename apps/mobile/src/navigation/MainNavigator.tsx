import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@somni/types';
import { CustomTabBar } from '../components/molecules/CustomTabBar';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../hooks/useTheme';

// Import screens
import { FeedScreen } from '../screens/main/FeedScreen';
import { DreamDiaryScreen } from '../screens/main/DreamDiaryScreen';
import { RecordScreen } from '../screens/main/RecordScreen';
import { MetaAnalysisScreen } from '../screens/main/MetaAnalysisScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Record"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          headerTitle: t('navigation.screens.feed.title') as string,
        }}
      />
      <Tab.Screen 
        name="DreamDiary" 
        component={DreamDiaryScreen}
        options={{
          headerTitle: t('navigation.screens.dreamDiary.title') as string,
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={RecordScreen}
        options={{
          headerShown: false, // Hide header for record screen
        }}
      />
      <Tab.Screen 
        name="MetaAnalysis" 
        component={MetaAnalysisScreen}
        options={{
          headerTitle: t('navigation.screens.metaAnalysis.title') as string,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerTitle: t('navigation.screens.profile.title') as string,
        }}
      />
    </Tab.Navigator>
  );
}