# API Reference

## 🌙 Current Implementation Overview

**Last Updated**: December 2024  
**Implementation Status**: Features 1.1, 1.2, 2.1 Complete ✅

This document provides comprehensive information about the **actually implemented** Supabase integration, API calls, and backend services used in the Somni project. All APIs listed here are currently working in the codebase.

---

## ✅ Implemented Supabase Configuration

### Environment Variables

#### Mobile App (`.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: The mobile app only needs these two environment variables for the current implementation.

### Client Initialization

#### Mobile (React Native) - CURRENT IMPLEMENTATION

```typescript
// apps/mobile/src/infrastructure/auth/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

#### Web (React)

```typescript
// apps/web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## ✅ Current Database Schema (Implemented)

### Tables Structure

#### Users Profile Table - IMPLEMENTED ✅

```sql
-- Current working schema in production
CREATE TABLE users_profile (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  bed_time TIME,                               -- HH:MM:SS format
  wake_time TIME,                              -- HH:MM:SS format
  goals TEXT[],                                -- Array of dream goals
  lucidity_experience TEXT,                    -- Experience level
  privacy_settings JSONB,                      -- Privacy preferences
  onboarding_completed BOOLEAN DEFAULT FALSE,  -- Onboarding status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) enabled
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Security policies currently in use
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_profile
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users_profile
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Example User Profile Data Structure:

```typescript
// Actual data structure in use
interface UserProfile {
  id: string; // UUID from auth.users
  username?: string; // Optional unique username
  bed_time?: string; // "22:30:00" format
  wake_time?: string; // "06:30:00" format
  goals?: string[]; // ["rememberDreams", "achieveLucidity", ...]
  lucidity_experience?: string; // "beginner" | "intermediate" | "advanced" | "expert"
  privacy_settings?: {
    allowDataSharing: boolean;
    shareAnonymously: boolean;
    allowCommunityAccess: boolean;
  };
  onboarding_completed: boolean; // Always set after onboarding
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

#### Dreams Table

```sql
-- Custom enum for sleep phases
CREATE TYPE sleep_phase AS ENUM ('rem', 'nrem', 'light', 'deep', 'awake');

CREATE TABLE dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_transcript TEXT,
  refined_narrative TEXT,
  audio_url TEXT,
  sleep_phase sleep_phase,
  is_lucid BOOLEAN DEFAULT FALSE,
  mood_before SMALLINT CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after SMALLINT CHECK (mood_after >= 1 AND mood_after <= 5),
  embedding vector(1536) -- For OpenAI's text-embedding-3-small model
);

-- Enable RLS
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own dreams" ON dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX idx_dreams_embedding ON dreams USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;
```

#### Dream Analysis Table

```sql
CREATE TABLE dream_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('freudian', 'jungian', 'spiritual', 'neurobiological', 'cognitive', 'personal_pattern')),
  content TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  key_insights TEXT[] DEFAULT '{}',
  suggested_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dream_analysis ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view analysis of own dreams" ON dream_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_analysis.dream_id
      AND dreams.user_id = auth.uid()
    )
  );
```

#### Dream Symbols Table

```sql
CREATE TABLE dream_symbols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  position INTEGER,
  personal_meaning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dream_symbols ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view symbols of own dreams" ON dream_symbols
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_symbols.dream_id
      AND dreams.user_id = auth.uid()
    )
  );
```

## ✅ Authentication API (Implemented)

### User Registration - IMPLEMENTED ✅

```typescript
// apps/mobile/src/infrastructure/auth/authService.ts
export class AuthService {
  // Current sign-up implementation
  static async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // Stored in user metadata
        },
      },
    });

    if (error) throw error;
    return data;
  }

  // Current sign-in implementation
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Sign-out implementation
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  static async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }
}
```

### Auth Error Handling - IMPLEMENTED ✅

```typescript
// Common auth errors handled in the app
export enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'invalid_grant',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  TOO_MANY_ATTEMPTS = 'too_many_requests',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'user_already_exists',
}

// Error handling pattern used throughout the app
export const handleAuthError = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email rate limit exceeded':
      return 'Too many attempts. Please try again later.';
    case 'User already registered':
      return 'An account with this email already exists.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
```

## ✅ User Profile API (Implemented)

### Profile Management - IMPLEMENTED ✅

```typescript
// apps/mobile/src/infrastructure/repositories/userRepository.ts
export class UserRepository {
  // Create profile after successful registration
  static async createProfile(
    userId: string,
    profileData: Partial<UserProfile>,
  ) {
    const { data, error } = await supabase
      .from('users_profile')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user profile
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    return data;
  }

  // Update profile (used during onboarding)
  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users_profile')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

### Onboarding Data Persistence - IMPLEMENTED ✅

```typescript
// Onboarding completion flow
export const completeOnboarding = async (
  userId: string,
  onboardingData: OnboardingData,
): Promise<UserProfile> => {
  // Transform onboarding data to profile format
  const profileUpdates = {
    bed_time: `${onboardingData.bedtime}:00`, // Convert "22:30" to "22:30:00"
    wake_time: `${onboardingData.wakeTime}:00`, // Convert "06:30" to "06:30:00"
    goals: onboardingData.selectedGoals,
    lucidity_experience: onboardingData.lucidityExperience,
    privacy_settings: onboardingData.privacySettings,
    onboarding_completed: true,
  };

  return UserRepository.updateProfile(userId, profileUpdates);
};
```

## ✅ Store Integration (Implemented)

### AuthStore API - IMPLEMENTED ✅

```typescript
// packages/stores/src/authStore.ts
export interface AuthStore {
  // State
  user: User | null; // Supabase auth user
  profile: UserProfile | null; // Extended profile data
  isAuthenticated: boolean; // Authentication status
  isLoading: boolean; // Loading state

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => void;
}

// Usage in components
const Component = () => {
  const { user, profile, isAuthenticated } = useAuthStore();

  // Access current user and profile data
  if (isAuthenticated && profile) {
    // User is logged in and has completed setup
  }
};
```

### OnboardingStore API - IMPLEMENTED ✅

```typescript
// packages/stores/src/onboardingStore.ts
export interface OnboardingStore {
  data: OnboardingData;

  // Individual field setters
  setBedtime: (time: string) => void; // "HH:MM" format
  setWakeTime: (time: string) => void; // "HH:MM" format
  setGoals: (goals: string[]) => void; // Goal IDs array
  setLucidityExperience: (level: string) => void; // Experience level
  setPrivacySettings: (settings: PrivacySettings) => void;

  // Lifecycle
  reset: () => void; // Clear all data
}

// Usage during onboarding flow
const OnboardingScreen = () => {
  const { data, setGoals } = useOnboardingStore();

  const handleGoalSelection = (selectedGoals: string[]) => {
    setGoals(selectedGoals);
  };
};
```

## ✅ Translation API (Implemented)

### i18next Integration - IMPLEMENTED ✅

```typescript
// apps/mobile/src/hooks/useTranslation.ts
export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nextTranslation(namespace);

  return {
    t: (key: string, options?: any) => String(t(key, options)),
    i18n,
    ready: i18n.isInitialized,
  };
};

// Usage in components
const Component = () => {
  const { t } = useTranslation('auth');

  return (
    <Text>{t('signIn.title')}</Text>  // "Return to the Dream Realm"
  );
};
```

### Translation Namespace Structure - IMPLEMENTED ✅

```typescript
// Current translation structure
interface TranslationNamespaces {
  auth: {
    signIn: {
      title: string; // "Return to the Dream Realm"
      subtitle: string; // "Continue your journey through the oniric realm"
      email: string; // "Email"
      password: string; // "Secret Key"
      button: string; // "Enter Dreams"
      // ... more fields
    };
    signUp: {
      title: string; // "Enter the Dream Realm"
      // ... more fields
    };
  };
  onboarding: {
    welcome: {
      title: string; // "Welcome to the Dream Realm"
      // ... more fields
    };
    // ... more screens
  };
  common: {
    button: {
      continue: string; // "Continue"
      next: string; // "Next"
      back: string; // "Back"
    };
  };
}
```

## 🔄 Planned APIs (Not Yet Implemented)

> **Note**: The following APIs are planned for future phases and are **not yet implemented** in the current codebase.

### Dream Recording API (Planned for Phase 5)

```typescript
// PLANNED - Not yet implemented
interface DreamAPI {
  createDream(dreamData: CreateDreamData): Promise<Dream>;
  updateDream(dreamId: string, updates: Partial<Dream>): Promise<Dream>;
  getUserDreams(userId: string): Promise<Dream[]>;
  deleteDream(dreamId: string): Promise<void>;
}
```

### AI Analysis API (Planned for Phase 6)

```typescript
// PLANNED - Not yet implemented
interface AnalysisAPI {
  analyzeDream(
    dreamId: string,
    analysisType: AnalysisType,
  ): Promise<DreamAnalysis>;
  getAnalysisHistory(dreamId: string): Promise<DreamAnalysis[]>;
}
```

---

## Error Handling Patterns

### Supabase Error Handling - IMPLEMENTED ✅

```typescript
// Standard error handling pattern used throughout the app
export const handleSupabaseError = (
  error: PostgrestError | AuthError,
): string => {
  // Database constraint violations
  if (error.code === '23505') {
    if (error.message.includes('username')) {
      return 'This username is already taken. Please choose another.';
    }
    if (error.message.includes('email')) {
      return 'This email is already registered. Please sign in instead.';
    }
  }

  // Row Level Security violations
  if (error.code === '42501') {
    return "You don't have permission to perform this action.";
  }

  // Network or connection errors
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};
```

### Component Error Boundaries - IMPLEMENTED ✅

```typitten
// Error handling in components
const AuthScreen = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (data: SignInData) => {
    try {
      setError(null);
      await AuthService.signIn(data.email, data.password);
    } catch (err) {
      const errorMessage = err instanceof Error ?
        handleAuthError(err as AuthError) :
        'An unexpected error occurred';
      setError(errorMessage);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onDismiss={() => setError(null)} />;
  }

  // ... rest of component
};
```

---

## Rate Limiting & Security

### Supabase Built-in Protections - ACTIVE ✅

- **Authentication rate limiting**: 5 attempts per hour per IP for auth endpoints
- **Row Level Security (RLS)**: All user data protected by RLS policies
- **JWT token validation**: All requests validated with Supabase JWT
- **HTTPS only**: All API communications over secure HTTPS

### App-Level Security Measures - IMPLEMENTED ✅

```typescript
// Secure token storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase automatically handles secure token storage via AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Encrypted storage on device
    autoRefreshToken: true, // Automatic token refresh
    persistSession: true, // Secure session persistence
  },
});
```

---

This API reference reflects the **actual working implementation** in the Somni codebase as of Features 1.1, 1.2, and 2.1 completion. All APIs listed in the "Implemented" sections are currently functioning and can be relied upon for development.
