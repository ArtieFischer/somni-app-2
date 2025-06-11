import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Main tab navigator param list
export type MainTabParamList = {
  Feed: undefined;
  DreamDiary: undefined;
  Record: undefined;
  MetaAnalysis: undefined;
  Profile: undefined;
};

// For type-safe navigation in screens
export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<any>
  >;

// Tab names for easier reference
export const TAB_NAMES = {
  FEED: 'Feed',
  DREAM_DIARY: 'DreamDiary',
  RECORD: 'Record',
  META_ANALYSIS: 'MetaAnalysis',
  PROFILE: 'Profile',
} as const;

// Tab icon names
export type TabIconName = 'feed' | 'diary' | 'record' | 'analysis' | 'profile';