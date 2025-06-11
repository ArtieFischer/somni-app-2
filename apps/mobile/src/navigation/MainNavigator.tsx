import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@somni/types';
import { CustomTabBar } from '../components/molecules/CustomTabBar';

// Import screens
import { FeedScreen } from '../screens/main/FeedScreen';
import { DreamDiaryScreen } from '../screens/main/DreamDiaryScreen';
import { RecordScreen } from '../screens/main/RecordScreen';
import { MetaAnalysisScreen } from '../screens/main/MetaAnalysisScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Record"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // We'll add custom headers later
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="DreamDiary" component={DreamDiaryScreen} />
      <Tab.Screen name="Record" component={RecordScreen} />
      <Tab.Screen name="MetaAnalysis" component={MetaAnalysisScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}