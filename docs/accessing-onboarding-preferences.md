# Accessing User Onboarding Preferences

This document explains how to access the user's onboarding answers in the Somni app.

## Overview

During onboarding, users are asked two key preference questions:
1. **Do you want to improve your sleep quality?**
   - Options: `'yes'` | `'no'` | `'not_sure'`
2. **Are you interested in lucid dreaming?**
   - Options: `'yes'` | `'no'` | `'dont_know_yet'`

These answers are stored in the user's profile and can be accessed throughout the app.

## Data Structure

The preferences are stored in the `UserProfile` interface (defined in `packages/types/src/index.ts`):

```typescript
export interface UserProfile {
  // ... other fields
  improve_sleep_quality?: 'yes' | 'no' | 'not_sure';
  interested_in_lucid_dreaming?: 'yes' | 'no' | 'dont_know_yet';
  // ... other fields
}
```

## How to Access

### Using the useAuth Hook

The primary way to access user preferences is through the `useAuth` hook:

```typescript
import { useAuth } from '../../hooks/useAuth';

const MyComponent = () => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!profile) {
    return <Text>No user profile found</Text>;
  }
  
  // Access the preferences
  const wantsToImproveSleep = profile.improve_sleep_quality;
  const interestedInLucidDreaming = profile.interested_in_lucid_dreaming;
  
  // Use in conditional rendering
  if (profile.improve_sleep_quality === 'yes') {
    // Show sleep improvement features
  }
  
  if (profile.interested_in_lucid_dreaming === 'yes') {
    // Show lucid dreaming features
  }
  
  return (
    <View>
      <Text>Sleep Quality Interest: {profile.improve_sleep_quality}</Text>
      <Text>Lucid Dreaming Interest: {profile.interested_in_lucid_dreaming}</Text>
    </View>
  );
};
```

### Using the Auth Store Directly

If you need to access the profile from a non-component context:

```typescript
import { useAuthStore } from '@somni/stores';

// Get the current profile
const profile = useAuthStore.getState().profile;

// Subscribe to profile changes
const unsubscribe = useAuthStore.subscribe(
  (state) => state.profile,
  (profile) => {
    if (profile) {
      console.log('Sleep quality preference:', profile.improve_sleep_quality);
      console.log('Lucid dreaming preference:', profile.interested_in_lucid_dreaming);
    }
  }
);
```

## Implementation Details

### Where Preferences Are Collected

- **Component**: `/apps/mobile/src/screens/onboarding/steps/StepPreferences.tsx`
- **Step**: Step 4 of the onboarding flow
- Users select from radio button options for each preference

### Where Preferences Are Stored

- **Database Table**: `users_profile`
- **Columns**: `improve_sleep_quality`, `interested_in_lucid_dreaming`
- Stored when the user completes onboarding in `OnboardingScreen.tsx`

### How Preferences Are Loaded

1. When a user signs in, the `useAuth` hook automatically fetches their profile
2. The `UserRepository` fetches the complete profile from Supabase
3. The profile is stored in the auth store and made available via the `useAuth` hook

## Example Use Cases

### 1. Conditional Feature Display

```typescript
const DreamJournal = () => {
  const { profile } = useAuth();
  
  return (
    <View>
      {profile?.improve_sleep_quality === 'yes' && (
        <SleepQualityTracker />
      )}
      
      {profile?.interested_in_lucid_dreaming !== 'no' && (
        <LucidDreamingTips />
      )}
    </View>
  );
};
```

### 2. Personalized Recommendations

```typescript
const HomeScreen = () => {
  const { profile } = useAuth();
  
  const getRecommendations = () => {
    const recommendations = [];
    
    if (profile?.improve_sleep_quality === 'yes') {
      recommendations.push('Track your sleep patterns');
      recommendations.push('Set a consistent bedtime');
    }
    
    if (profile?.interested_in_lucid_dreaming === 'yes') {
      recommendations.push('Keep a dream journal');
      recommendations.push('Practice reality checks');
    }
    
    return recommendations;
  };
  
  return <RecommendationsList items={getRecommendations()} />;
};
```

### 3. Analytics and Tracking

```typescript
const trackUserPreferences = () => {
  const { profile } = useAuth();
  
  if (profile) {
    analytics.track('user_preferences', {
      improve_sleep_quality: profile.improve_sleep_quality,
      interested_in_lucid_dreaming: profile.interested_in_lucid_dreaming,
    });
  }
};
```

## Helper Functions

For formatting preference values for display:

```typescript
const formatPreference = (value?: string) => {
  switch (value) {
    case 'yes': return 'Yes';
    case 'no': return 'No';
    case 'not_sure': return 'Not sure';
    case 'dont_know_yet': return "Don't know yet";
    default: return 'Not specified';
  }
};
```

## Demo Component

A complete demo component showing how to access and display user preferences is available at:
`/apps/mobile/src/screens/demo/UserPreferencesDemo.tsx`

## Important Notes

1. **Always check if profile exists** before accessing preferences
2. **Handle loading states** while the profile is being fetched
3. **Preferences are optional** - they may be undefined if the user hasn't completed onboarding
4. **Use TypeScript** to ensure type safety when accessing preference values