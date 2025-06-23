import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export const ProfileIcons = {
  // User Preferences
  displayName: {
    family: Ionicons,
    name: 'person-circle-outline',
  },
  language: {
    family: Ionicons,
    name: 'globe-outline',
  },
  location: {
    family: Ionicons,
    name: 'location-outline',
  },
  email: {
    family: Ionicons,
    name: 'mail-outline',
  },
  privacy: {
    family: Ionicons,
    name: 'shield-checkmark-outline',
  },
  
  // Dreaming Preferences
  dreamGuide: {
    family: MaterialCommunityIcons,
    name: 'crystal-ball',
  },
  sleepQuality: {
    family: Ionicons,
    name: 'moon-outline',
  },
  sleepSchedule: {
    family: Ionicons,
    name: 'bed-outline',
  },
  lucidDreaming: {
    family: Ionicons,
    name: 'sparkles',
  },
  
  // Support Section
  helpCenter: {
    family: Ionicons,
    name: 'help-circle-outline',
  },
  contactSupport: {
    family: Ionicons,
    name: 'chatbubbles-outline',
  },
  privacyPolicy: {
    family: Ionicons,
    name: 'document-lock-outline',
  },
  termsOfService: {
    family: Ionicons,
    name: 'document-text-outline',
  },
  debugSettings: {
    family: Ionicons,
    name: 'construct-outline',
  },
  
  // Status Icons
  premium: {
    family: Ionicons,
    name: 'star',
  },
  locationPin: {
    family: Ionicons,
    name: 'location-sharp',
  },
  
  // Empty States
  emptySharedDreams: {
    family: MaterialCommunityIcons,
    name: 'moon-waxing-crescent',
  },
} as const;

export type ProfileIconKey = keyof typeof ProfileIcons;