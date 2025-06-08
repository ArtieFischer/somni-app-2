# TypeScript Types & Interfaces

This document provides a comprehensive reference for all TypeScript types and interfaces used throughout the Somni project, including implemented authentication, onboarding, and component types.

## 🌙 Current Implementation Status

**Last Updated**: December 2024
**Implementation Progress**: Features 1.1, 1.2, 2.1 Complete ✅

This documentation reflects the **actual implemented types** in the current Somni codebase, organized by implementation status:

- ✅ **Implemented**: Currently working types in the codebase
- 🔄 **Planned**: Types for future features (Dreams, Analysis, etc.)

## ✅ Implemented Authentication & User Types

### User Profile (Supabase Schema)

```typescript
// Current database schema - users_profile table
export interface UserProfile {
  id: string; // UUID, references auth.users(id)
  username?: string; // Unique username
  bed_time?: string; // TIME format "HH:MM:SS"
  wake_time?: string; // TIME format "HH:MM:SS"
  goals?: string[]; // Array of dream goals
  lucidity_experience?: string; // Experience level
  privacy_settings?: {
    // JSONB privacy preferences
    allowDataSharing: boolean;
    shareAnonymously: boolean;
    allowCommunityAccess: boolean;
  };
  onboarding_completed: boolean; // Onboarding completion status
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}
```

### Supabase User (from @supabase/supabase-js)

```typescript
// Supabase Auth User type
export interface User {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  identities?: UserIdentity[];
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
}
```

## ✅ Implemented Store Types

### Auth Store (packages/stores/src/authStore.ts)

```typescript
export interface AuthStore {
  // State
  user: User | null; // Supabase Auth User
  profile: UserProfile | null; // Extended user profile
  isAuthenticated: boolean; // Authentication status
  isLoading: boolean; // Loading state

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => void;
}
```

### Onboarding Store (packages/stores/src/onboardingStore.ts)

```typescript
export interface OnboardingData {
  bedtime: string; // "HH:MM" format
  wakeTime: string; // "HH:MM" format
  selectedGoals: string[]; // Array of goal IDs
  lucidityExperience: string; // Experience level
  privacySettings: {
    allowDataSharing: boolean;
    shareAnonymously: boolean;
    allowCommunityAccess: boolean;
  };
}

export interface OnboardingStore {
  // State
  data: OnboardingData;

  // Screen-specific setters
  setBedtime: (time: string) => void;
  setWakeTime: (time: string) => void;
  setGoals: (goals: string[]) => void;
  setLucidityExperience: (level: string) => void;
  setPrivacySettings: (settings: OnboardingData['privacySettings']) => void;

  // Lifecycle
  reset: () => void;
}
```

## ✅ Implemented Component Types

### Button Component (apps/mobile/src/components/atoms/Button/)

```typescript
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// Required heights for accessibility
const BUTTON_HEIGHTS = {
  small: 40, // Minimum for secondary actions
  medium: 48, // Standard minimum touch target (WCAG)
  large: 56, // Primary actions
} as const;
```

### Input Component (apps/mobile/src/components/atoms/Input/)

```typescript
export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string; // Optional label text
  error?: string; // Error message
  helperText?: string; // Helper text below input
  leftIcon?: React.ReactNode; // Left side icon
  rightIcon?: React.ReactNode; // Right side icon
  variant?: 'default' | 'filled'; // Visual variant
  required?: boolean; // Required field indicator
}
```

### Text Component (apps/mobile/src/components/atoms/Text/)

```typescript
export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error';
  children: React.ReactNode;
}
```

### MultiSelectChip Component (apps/mobile/src/components/molecules/MultiSelectChip/)

```typescript
export interface MultiSelectChipProps {
  options: ChipOption[]; // Available options
  selectedOptions: string[]; // Currently selected option IDs
  onSelectionChange: (selected: string[]) => void;
  maxSelections?: number; // Maximum allowed selections
  label?: string; // Group label
}

export interface ChipOption {
  id: string; // Unique identifier
  label: string; // Display text
  description?: string; // Optional description
}
```

## ✅ Implemented Navigation Types

### Navigation Structure

```typescript
// Current navigation hierarchy
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  SleepSchedule: undefined;
  Goals: undefined;
  Lucidity: undefined;
  Privacy: undefined;
  Complete: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList =
  | AuthStackParamList
  | OnboardingStackParamList
  | MainStackParamList;
```

## ✅ Implemented Theme Types

### Oniric Theme System (packages/theme/)

```typescript
export interface ThemeColors {
  background: {
    primary: string; // Deep midnight blue #0B1426
    elevated: string; // Cards and surfaces #1A2332
  };
  primary: string; // Aurora purple #8B5CF6
  primaryMuted: string; // Muted purple #A78BFA
  accent: string; // Ethereal teal #10B981
  text: {
    primary: string; // Starlight white #F8FAFC
    secondary: string; // Silver #CBD5E1
    muted: string; // Muted gray #64748B
  };
  border: string; // Border color
  error: string; // Error states
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number; // 4
    small: number; // 8
    medium: number; // 16
    large: number; // 24
    xl: number; // 32
  };
  borderRadius: {
    small: number; // 4
    medium: number; // 8
    large: number; // 12
  };
  shadows: {
    small: object; // Purple-tinted shadows
    medium: object;
    large: object;
  };
}
```

## ✅ Implemented Translation Types

### Localization Types (packages/locales/)

```typescript
export interface AuthTranslations {
  signIn: {
    title: string; // "Return to the Dream Realm"
    subtitle: string;
    email: string;
    password: string;
    button: string; // "Enter Dreams"
    forgotPassword: string; // "Forgotten Path?"
    noAccount: string;
    signUp: string; // "Begin Journey"
    error: {
      invalidCredentials: string;
      networkError: string;
      tooManyAttempts: string;
    };
  };
  signUp: {
    title: string; // "Enter the Dream Realm"
    subtitle: string;
    username: string; // "Dream Name"
    email: string;
    password: string; // "Secret Key"
    button: string; // "Begin Dream Journey"
    hasAccount: string;
    signIn: string; // "Return to Realm"
  };
}

export interface OnboardingTranslations {
  welcome: {
    title: string; // "Welcome to the Dream Realm"
    subtitle: string;
    button: string;
  };
  sleepSchedule: {
    title: string;
    bedtime: string;
    wakeTime: string;
    button: string;
  };
  goals: {
    title: string; // "Your Dream Aspirations"
    subtitle: string;
    options: {
      rememberDreams: string;
      achieveLucidity: string;
      improveCreativity: string;
      betterSleep: string;
      symbolAnalysis: string;
      trackPatterns: string;
    };
    button: string;
  };
  // ... other onboarding screen translations
}
```

## ✅ Implemented Form Types

### React Hook Form Integration

```typescript
// Sign-in form schema with Zod validation
export interface SignInData {
  email: string;
  password: string;
}

// Sign-up form schema with Zod validation
export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

// Onboarding form types
export interface SleepScheduleFormData {
  bedtime: string; // "HH:MM" format
  wakeTime: string; // "HH:MM" format
}

export interface GoalsFormData {
  selectedGoals: string[]; // Array of goal IDs
}

export interface LucidityFormData {
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface PrivacyFormData {
  allowDataSharing: boolean;
  shareAnonymously: boolean;
  allowCommunityAccess: boolean;
}
```

## ✅ Implemented Service Types

### Supabase Service Types

```typescript
// User repository for profile management
export interface UserRepository {
  createProfile: (
    userId: string,
    profileData: Partial<UserProfile>,
  ) => Promise<UserProfile>;
  getProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (
    userId: string,
    updates: Partial<UserProfile>,
  ) => Promise<UserProfile>;
}

// Auth service types
export interface AuthService {
  signInWithEmail: (
    data: SignInData,
  ) => Promise<{ user: User; session: Session }>;
  signUpWithEmail: (
    data: SignUpData,
  ) => Promise<{ user: User; session: Session }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
}
```

---

## 🔄 Planned Types (Future Implementation)

> **Note**: The following types are planned for future features and not yet implemented in the codebase.

### Dream Recording & Analysis Types (Planned)

```typescript
// Planned for Phase 5: Dream Recording Interface
export interface Dream {
  id: string;
  user_id: string;
  raw_transcript: string;
  refined_narrative?: string;
  audio_url?: string;
  sleep_phase?: SleepPhase;
  is_lucid?: boolean;
  mood_before?: number;
  mood_after?: number;
  created_at: string;
  updated_at?: string;
  embedding?: number[];
}

export type SleepPhase = 'N1' | 'N2' | 'N3' | 'REM' | 'WAKE';

// Planned for Phase 6: AI Dream Analysis
export interface DreamAnalysis {
  id: string;
  dream_id: string;
  analysis_type: 'freudian' | 'jungian' | 'spiritual' | 'neurobiological';
  content: string;
  confidence?: number;
  key_insights: string[];
  suggested_actions: string[];
  created_at: string;
}
```

### Recording Session Types (Planned)

```typescript
// Planned for Phase 5: Dream Recording
export interface RecordingSession {
  id: string;
  status:
    | 'idle'
    | 'recording'
    | 'processing'
    | 'transcribing'
    | 'completed'
    | 'error';
  startTime?: string;
  endTime?: string;
  duration?: number;
  audioUri?: string;
  transcript?: string;
  error?: string;
}

export interface AudioService {
  requestPermissions(): Promise<boolean>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioRecordingResult>;
  getIsRecording(): boolean;
  getDuration(): number;
}
```

## Type Usage Patterns

### Store Integration Pattern

```typescript
// Pattern for accessing stores in components
const Component: React.FC = () => {
  const { user, profile, isAuthenticated } = useAuthStore();
  const { data: onboardingData, setGoals } = useOnboardingStore();

  // Component logic
};
```

### Navigation Pattern

```typescript
// Pattern for typed navigation
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goals'>;

const OnboardingGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lucidity');
  };
};
```

### Form Validation Pattern

```typescript
// Pattern for form validation with Zod
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInData = z.infer<typeof SignInSchema>;
```

This documentation reflects the current implemented types in the Somni codebase as of the completion of Features 1.1, 1.2, and 2.1. All types marked as "Implemented" are actively used in the current codebase and can be relied upon for development.
