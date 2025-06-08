# TypeScript Types & Interfaces

This document provides a comprehensive reference for all TypeScript types and interfaces used throughout the Somni project, including the new clean architecture domain types and shared package interfaces.

## Core Domain Types (`@somni/core`)

### Domain Entities

The domain layer defines business entities that encapsulate business rules and validation logic.

#### Dream Entity
```typescript
export class Dream {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly rawTranscript: string,
    public readonly refinedNarrative?: string,
    public readonly audioUrl?: string,
    public readonly sleepPhase?: SleepPhase,
    public readonly isLucid?: boolean,
    public readonly moodBefore?: number,
    public readonly moodAfter?: number,
    public readonly createdAt?: string,
    public readonly updatedAt?: string,
    public readonly embedding?: number[]
  ) {}

  static create(dreamData: Partial<DreamType>): Dream;
  toDTO(): DreamType;
}
```

**Usage**: Represents a dream entity with business logic and validation
**Methods**:
- `create()`: Factory method with validation
- `toDTO()`: Converts to database format

#### User Entity
```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly username?: string,
    public readonly displayName?: string,
    public readonly avatarUrl?: string,
    public readonly isPremium: boolean = false,
    public readonly onboardingCompleted: boolean = false,
    public readonly sleepSchedule?: { bedtime: string; wake_time: string },
    public readonly lucidDreamSettings?: object,
    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {}

  static create(userData: Partial<UserProfile>): User;
  updateProfile(updates: Partial<UserProfile>): User;
  toDTO(): UserProfile;
}
```

### Use Case Types

#### Record Dream Use Case
```typescript
export interface RecordDreamRequest {
  userId: string;
  rawTranscript: string;
  audioUrl?: string;
  sleepPhase?: string;
  moodBefore?: number;
}

export class RecordDreamUseCase {
  constructor(private dreamRepository: IDreamRepository) {}
  async execute(request: RecordDreamRequest): Promise<Dream>;
}
```

#### Analyze Dream Use Case
```typescript
export interface AnalyzeDreamRequest {
  dreamId: string;
  analysisTypes: AnalysisType[];
}

export interface DreamAnalysis {
  id: string;
  dreamId: string;
  analysisType: string;
  content: string;
  confidence?: number;
  keyInsights: string[];
  suggestedActions: string[];
}

export type AnalysisType = 
  | 'freudian' 
  | 'jungian' 
  | 'spiritual' 
  | 'neurobiological' 
  | 'cognitive' 
  | 'personal_pattern';
```

### Repository Interfaces

#### Dream Repository Interface
```typescript
export interface IDreamRepository {
  save(dream: Dream): Promise<Dream>;
  findById(id: string): Promise<Dream | null>;
  findByUserId(userId: string): Promise<Dream[]>;
  update(id: string, updates: Partial<Dream>): Promise<Dream>;
  delete(id: string): Promise<void>;
  search(query: string, userId?: string): Promise<Dream[]>;
}
```

#### User Repository Interface
```typescript
export interface IUserRepository {
  save(user: UserProfile): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | null>;
  update(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}
```

## State Management Types (`@somni/stores`)

### Authentication Store
```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}
```

### Dream Store
```typescript
interface DreamFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  sleepPhases?: string[];
  isLucid?: boolean;
  moodRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

interface RecordingSession {
  id: string;
  status: 'idle' | 'recording' | 'processing' | 'transcribing' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  duration?: number;
  audioUri?: string;
  transcript?: string;
  error?: string;
}

interface DreamState {
  // Dreams data
  dreams: Dream[];
  currentDream: Dream | null;
  isLoading: boolean;
  error: string | null;
  filters: DreamFilters;
  
  // Recording state
  recordingSession: RecordingSession | null;
  isRecording: boolean;
  recordingDuration: number;
  recordingAmplitude: number;
  
  // Actions
  setDreams: (dreams: Dream[]) => void;
  addDream: (dream: Dream) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  // ... other actions
}
```

### Settings Store
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    enabled: boolean;
    dreamReminders: boolean;
    analysisComplete: boolean;
    communityUpdates: boolean;
  };
  privacy: {
    shareAnonymously: boolean;
    allowDataCollection: boolean;
  };
  recording: {
    whisperMode: boolean;
    autoTranscribe: boolean;
    saveAudio: boolean;
  };
  analysis: {
    defaultLenses: string[];
    autoAnalyze: boolean;
  };
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  resetSettings: () => void;
}
```

## Theme System Types (`@somni/theme`)

### Theme Interface
```typescript
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      primary: string;
      secondary: string;
      elevated: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      inverse: string;
      disabled: string;
    };
    button: {
      primary: { background: string; text: string; border: string };
      secondary: { background: string; text: string; border: string };
      ghost: { background: string; text: string; border: string };
    };
    status: {
      error: string;
      warning: string;
      success: string;
      info: string;
    };
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
  };
  spacing: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
    button: {
      small: { fontSize: number; fontWeight: string };
      medium: { fontSize: number; fontWeight: string };
      large: { fontSize: number; fontWeight: string };
    };
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    round: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}
```

### Color System
```typescript
export const colors = {
  purple: {
    50: '#F3F0FF',
    100: '#E9E2FF',
    // ... full color scale
    500: '#7C3AED', // Primary purple
    900: '#3C1A78',
  },
  // ... other color scales (blue, gray, red, green, yellow)
};
```

## Internationalization Types (`@somni/locales`)

### Translation Types
```typescript
import en from './en';

export type TranslationKeys = typeof en;
export type Namespace = keyof TranslationKeys;

// Usage in components
export const useTranslation = <N extends Namespace>(namespace?: N) => {
  const { t, ...rest } = useI18nTranslation(namespace);
  
  return {
    t: (key: string, options?: any) => t(key, options),
    ...rest,
  };
};
```

### Translation Structure
```typescript
// Example translation structure
interface CommonTranslations {
  app: {
    name: string;
    tagline: string;
  };
  navigation: {
    home: string;
    record: string;
    dreams: string;
    community: string;
    profile: string;
  };
  actions: {
    save: string;
    cancel: string;
    delete: string;
    // ... other actions
  };
}
```

## Database Schema Types (`@somni/types`)

### Current Database Schema Types

#### UserProfile Interface
```typescript
export interface UserProfile {
  id: string; // UUID from auth.users
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  sleep_schedule?: {
    bedtime: string; // e.g., "22:30"
    wake_time: string; // e.g., "06:30"
  };
  lucid_dream_settings?: object;
}
```

#### Sleep Phase Type
```typescript
export type SleepPhase = 'rem' | 'nrem' | 'light' | 'deep' | 'awake';
```

#### Dream Interface
```typescript
export interface Dream {
  id: string; // UUID
  user_id: string; // UUID
  created_at: string; // ISO 8601 string
  updated_at?: string; // ISO 8601 string
  raw_transcript?: string;
  refined_narrative?: string;
  audio_url?: string;
  sleep_phase?: SleepPhase;
  is_lucid?: boolean;
  mood_before?: number; // 1-5
  mood_after?: number; // 1-5
  embedding?: number[]; // Vector represented as an array
}
```

### Legacy Interfaces (Deprecated)

> **Note**: These interfaces are maintained for backward compatibility but will be removed in future versions. Please migrate to the new domain entities and database schema types.

#### User Interface (Legacy)
```typescript
export interface User {
  id: string;
  email?: string;
}
```

#### DreamEntry Interface (Legacy)
```typescript
export interface DreamEntry {
  id: string;
  userId: string;
  date: string; // ISO Date string
  title: string;
  content: string;
  interpretation?: string;
  tags?: string[];
}
```

## Component Props Types

### UI Component Props

#### Text Component
```typescript
export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'inverse' | 'disabled';
  children: React.ReactNode;
}
```

#### Button Component
```typescript
export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  loading?: boolean;
}
```

### Screen Props

#### Navigation Props
```typescript
export type RootStackParamList = {
  Home: undefined;
  DreamDetail: { dreamId: string };
  DreamEntry: { editDreamId?: string };
  Recording: undefined;
  Profile: undefined;
  Settings: undefined;
  Community: undefined;
  Analysis: { dreamId: string; analysisType: AnalysisType };
  LucidTraining: undefined;
};

export type TabParamList = {
  Dreams: undefined;
  Record: undefined;
  Community: undefined;
  Profile: undefined;
};
```

## Infrastructure Types

### Service Interfaces

#### Audio Service
```typescript
export interface AudioRecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class AudioService {
  async requestPermissions(): Promise<boolean>;
  async startRecording(): Promise<void>;
  async stopRecording(): Promise<AudioRecordingResult>;
  getIsRecording(): boolean;
  getDuration(): number;
}
```

#### Speech Service
```typescript
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechService {
  async requestPermissions(): Promise<boolean>;
  async startListening(options?: {
    language?: string;
    continuous?: boolean;
    onResult?: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
  }): Promise<void>;
  async stopListening(): Promise<void>;
  getIsListening(): boolean;
}
```

## Hook Types

### Custom Hook Return Types

#### useAuth Hook
```typescript
export const useAuth = () => {
  return {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    clearError: () => void;
  };
};
```

#### useTheme Hook
```typescript
export const useTheme = (): Theme => {
  // Returns current theme based on settings and system preference
};
```

#### useTranslation Hook
```typescript
export const useTranslation = <N extends Namespace>(namespace?: N) => {
  return {
    t: (key: string, options?: any) => string;
    i18n: i18n;
    ready: boolean;
  };
};
```

#### useDreamRecorder Hook
```typescript
export const useDreamRecorder = () => {
  return {
    isRecording: boolean;
    duration: number;
    amplitude: number;
    session: RecordingSession | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
  };
};
```

## Utility Types

### Common Utility Types
```typescript
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Example usage
export type CreateDream = Optional<Dream, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDream = Partial<Omit<Dream, 'id' | 'user_id' | 'created_at'>>;
```

### Date and Time Types
```typescript
export type ISODateString = string; // ISO 8601 format
export type TimestampMs = number; // Unix timestamp in milliseconds
export type DurationMs = number; // Duration in milliseconds

export interface TimeRange {
  start: ISODateString;
  end: ISODateString;
}

export interface DateFilter {
  type: 'today' | 'week' | 'month' | 'year' | 'custom';
  range?: TimeRange;
}
```

## Type Guards and Validators

### Type Guard Functions
```typescript
export const isUserProfile = (obj: any): obj is UserProfile => {
  return typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.is_premium === 'boolean' &&
         typeof obj.onboarding_completed === 'boolean';
};

export const isDream = (obj: any): obj is Dream => {
  return typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.user_id === 'string' &&
         typeof obj.created_at === 'string';
};

export const isValidSleepPhase = (phase: string): phase is SleepPhase => {
  return ['rem', 'nrem', 'light', 'deep', 'awake'].includes(phase);
};

export const isValidAnalysisType = (type: string): type is AnalysisType => {
  return ['freudian', 'jungian', 'spiritual', 'neurobiological', 'cognitive', 'personal_pattern']
    .includes(type);
};
```

## Usage Examples

### Creating Domain Entities
```typescript
import { Dream, User } from '@somni/core';
import { Dream as DreamType, UserProfile } from '@somni/types';

// Create a dream entity with validation
const dreamData: Partial<DreamType> = {
  user_id: 'user-123',
  raw_transcript: 'I was flying over mountains...',
  sleep_phase: 'rem',
  mood_before: 3,
};

const dream = Dream.create(dreamData);
const dreamDTO = dream.toDTO(); // Convert back to database format
```

### Using State Management
```typescript
import { useDreamStore, useAuthStore } from '@somni/stores';

const DreamComponent = () => {
  const { dreams, addDream, isLoading } = useDreamStore();
  const { user } = useAuthStore();
  
  const handleAddDream = (dreamData: Partial<Dream>) => {
    const dream = Dream.create({
      ...dreamData,
      user_id: user?.id,
    });
    addDream(dream.toDTO());
  };
  
  // Component implementation...
};
```

### Using Theme System
```typescript
import { useTheme } from '@hooks/useTheme';
import { Theme } from '@somni/theme';

const ThemedComponent = () => {
  const theme = useTheme();
  
  const styles = {
    container: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.body.fontSize,
    },
  };
  
  // Component implementation...
};
```

### Using Translations
```typescript
import { useTranslation } from '@hooks/useTranslation';

const LocalizedComponent = () => {
  const { t } = useTranslation('dreams');
  
  return (
    <View>
      <Text>{t('record.title')}</Text>
      <Text>{t('record.subtitle')}</Text>
      <Button>{t('record.button.start')}</Button>
    </View>
  );
};
```

This comprehensive type reference ensures type safety and consistency across the entire Somni project while supporting the clean architecture and modern development patterns implemented in the codebase.