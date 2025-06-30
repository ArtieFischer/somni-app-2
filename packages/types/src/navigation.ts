import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Main Stack Navigator params
export type MainStackParamList = {
  MainTabs: undefined;
  DreamDetail: { dreamId: string; initialTab?: 'overview' | 'analysis' | 'journal' };
  Debug: undefined;
  SharedDreams: undefined;
};

// Main tab navigator param list
export type MainTabParamList = {
  Feed: undefined;
  DreamDiary: undefined;
  Record: undefined;
  MetaAnalysis: undefined;
  Profile: undefined;
};

// Auth Stack Navigator params
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Onboarding Stack Navigator params
export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalInfo: undefined;
  Preferences: undefined;
  Complete: undefined;
};

export type TabIconName = 'feed' | 'diary' | 'record' | 'analysis' | 'profile';

export const TAB_NAMES = {
  FEED: 'Feed',
  DREAM_DIARY: 'DreamDiary',
  RECORD: 'Record',
  META_ANALYSIS: 'MetaAnalysis',
  PROFILE: 'Profile',
} as const;

// Screen props types
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<MainStackParamList>
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> = NativeStackScreenProps<
  OnboardingStackParamList,
  T
>;