# TypeScript Types & Interfaces

This document provides a comprehensive reference for all TypeScript types and interfaces used throughout the Somni project.

## Core Types (`@somni/types`)

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
  lucid_dream_settings?: {
    // Define settings later
  };
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
}
```

**Usage**: Represents a user profile in the system, corresponding to the `users_profile` table
**Properties**:
- `id`: Unique identifier matching auth.users.id
- `username`: Unique username (3-24 characters)
- `display_name`: User's display name
- `avatar_url`: URL to user's avatar image
- `is_premium`: Premium subscription status
- `onboarding_completed`: Whether user completed onboarding
- `sleep_schedule`: JSON object with sleep preferences
- `lucid_dream_settings`: JSON object with lucid dreaming preferences

**Example**:
```typescript
const userProfile: UserProfile = {
  id: 'user-123',
  username: 'dreamer_2024',
  display_name: 'Dream Explorer',
  avatar_url: 'https://example.com/avatar.jpg',
  is_premium: false,
  onboarding_completed: true,
  sleep_schedule: {
    bedtime: "22:30",
    wake_time: "06:30"
  },
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z'
};
```

#### Sleep Phase Type
```typescript
export type SleepPhase = 'rem' | 'nrem' | 'light' | 'deep' | 'awake';
```

**Usage**: Represents different phases of sleep for dream categorization

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

**Usage**: Core dream entry data structure, corresponding to the `dreams` table
**Properties**:
- `id`: Unique identifier for the dream
- `user_id`: ID of the user who recorded the dream
- `created_at`: When the dream was recorded
- `updated_at`: When the dream was last modified
- `raw_transcript`: Original voice-to-text transcription
- `refined_narrative`: AI-processed and cleaned narrative
- `audio_url`: URL to the original audio recording
- `sleep_phase`: Phase of sleep when dream occurred
- `is_lucid`: Whether the dream was lucid
- `mood_before`: Mood rating before sleep (1-5)
- `mood_after`: Mood rating after waking (1-5)
- `embedding`: Vector embedding for semantic search

**Example**:
```typescript
const dream: Dream = {
  id: 'dream-456',
  user_id: 'user-123',
  created_at: '2024-01-15T06:30:00.000Z',
  updated_at: '2024-01-15T06:35:00.000Z',
  raw_transcript: 'I was flying over mountains and...',
  refined_narrative: 'In this vivid dream, I soared above snow-capped peaks...',
  audio_url: 'https://storage.supabase.co/dream-recordings/user-123/dream-456/recording.webm',
  sleep_phase: 'rem',
  is_lucid: false,
  mood_before: 3,
  mood_after: 4,
  embedding: [0.1, 0.2, 0.3, /* ... 1536 dimensions */]
};
```

### Legacy Interfaces (Deprecated)

> **Note**: These interfaces are maintained for backward compatibility but will be removed in future versions. Please migrate to the new `UserProfile` and `Dream` interfaces.

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

## Extended Types for Future Features

### Dream Analysis Types
```typescript
export interface DreamAnalysis {
  id: string;
  dream_id: string;
  analysis_type: AnalysisType;
  content: string;
  confidence: number; // 0-1
  key_insights: string[];
  suggested_actions: string[];
  created_at: string;
}

export type AnalysisType = 
  | 'freudian' 
  | 'jungian' 
  | 'spiritual' 
  | 'neurobiological' 
  | 'cognitive' 
  | 'personal_pattern';
```

### Dream Symbols Types
```typescript
export interface DreamSymbol {
  id: string;
  dream_id: string;
  name: string;
  category: string;
  confidence?: number; // 0-1
  position?: number; // position in dream text
  personal_meaning?: string;
  created_at: string;
}

export type SymbolCategory = 
  | 'people' 
  | 'animals' 
  | 'objects' 
  | 'places' 
  | 'emotions' 
  | 'actions' 
  | 'colors' 
  | 'numbers';
```

### Voice Recording Types
```typescript
export interface VoiceRecording {
  id: string;
  dream_id: string;
  audio_url: string;
  duration: number; // seconds
  transcription?: string;
  transcription_confidence?: number; // 0-1
  language: string;
  is_whisper_mode: boolean;
  created_at: string;
}

export type RecordingStatus = 
  | 'idle' 
  | 'recording' 
  | 'processing' 
  | 'transcribing' 
  | 'completed' 
  | 'error';

export interface RecordingSession {
  id: string;
  status: RecordingStatus;
  start_time?: string;
  end_time?: string;
  duration?: number;
  audio_blob?: Blob;
  error?: string;
}
```

### Lucid Dreaming Types
```typescript
export interface LucidDreamingGoal {
  id: string;
  user_id: string;
  type: GoalType;
  description: string;
  target_date?: string;
  is_completed: boolean;
  progress: number; // 0-100
  techniques: LucidTechnique[];
  created_at: string;
  completed_at?: string;
}

export type GoalType = 
  | 'first_lucid' 
  | 'increase_frequency' 
  | 'specific_experience' 
  | 'skill_practice' 
  | 'nightmare_control';

export type LucidTechnique = 
  | 'reality_checks' 
  | 'mild' 
  | 'wbtb' 
  | 'wild' 
  | 'fild' 
  | 'meditation' 
  | 'dream_journal';

export interface RealityCheck {
  id: string;
  user_id: string;
  type: RealityCheckType;
  result: boolean; // true if in dream, false if awake
  timestamp: string;
  notes?: string;
}

export type RealityCheckType = 
  | 'hands' 
  | 'clock' 
  | 'text' 
  | 'mirror' 
  | 'light_switch' 
  | 'nose_pinch';
```

### Community Features Types
```typescript
export interface CommunityPost {
  id: string;
  user_id: string; // Anonymous ID for privacy
  dream_id?: string;
  type: PostType;
  title: string;
  content: string;
  tags: string[];
  is_anonymous: boolean;
  reactions: CommunityReaction[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export type PostType = 
  | 'dream_share' 
  | 'question' 
  | 'insight' 
  | 'technique_share' 
  | 'interpretation_request';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string; // Anonymous ID
  content: string;
  parent_comment_id?: string;
  reactions: CommunityReaction[];
  created_at: string;
}

export interface CommunityReaction {
  id: string;
  user_id: string;
  type: ReactionType;
  comment?: string;
  created_at: string;
}

export type ReactionType = 
  | 'relate' 
  | 'insightful' 
  | 'beautiful' 
  | 'mysterious' 
  | 'helpful';

export interface DreamTrend {
  id: string;
  symbol: string;
  category: SymbolCategory;
  frequency: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  region?: string;
  age_group?: string;
  updated_at: string;
}
```

## API Response Types

### Generic API Response
```typescript
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  has_more?: boolean;
}
```

### Supabase Specific Types
```typescript
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
  count?: number;
  status: number;
  statusText: string;
}

export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}
```

## Form and Validation Types

### Dream Entry Forms
```typescript
export interface DreamEntryForm {
  raw_transcript: string;
  refined_narrative?: string;
  sleep_phase?: SleepPhase;
  is_lucid?: boolean;
  mood_before?: number;
  mood_after?: number;
}

export interface DreamEntryValidation {
  raw_transcript: {
    required: boolean;
    min_length: number;
    max_length: number;
  };
  refined_narrative: {
    max_length: number;
  };
  mood_before: {
    min: number;
    max: number;
  };
  mood_after: {
    min: number;
    max: number;
  };
}
```

### User Registration Forms
```typescript
export interface RegistrationForm {
  email: string;
  password: string;
  confirm_password: string;
  display_name?: string;
  username?: string;
  agree_to_terms: boolean;
  agree_to_privacy: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}
```

## State Management Types

### Store States
```typescript
export interface DreamStore {
  // State
  dreams: Dream[];
  current_dream: Dream | null;
  is_loading: boolean;
  error: string | null;
  filters: DreamFilters;
  
  // Actions
  addDream: (dream: Omit<Dream, 'id' | 'created_at' | 'updated_at'>) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  deleteDream: (id: string) => void;
  loadDreams: () => Promise<void>;
  setFilters: (filters: Partial<DreamFilters>) => void;
  clearError: () => void;
}

export interface DreamFilters {
  date_range?: {
    start: string;
    end: string;
  };
  sleep_phases?: SleepPhase[];
  is_lucid?: boolean;
  mood_range?: {
    min: number;
    max: number;
  };
  search_query?: string;
}

export interface UserStore {
  user: UserProfile | null;
  is_authenticated: boolean;
  is_loading: boolean;
  error: string | null;
  
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationForm) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export interface RecordingStore {
  session: RecordingSession | null;
  is_recording: boolean;
  is_processing: boolean;
  error: string | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  processRecording: () => Promise<string>; // Returns transcription
  clearSession: () => void;
}
```

## Navigation Types

### React Navigation Types
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

### Creating a New Dream Entry
```typescript
import { Dream, CreateDream } from '@somni/types';

const createDream = (dreamData: CreateDream): Dream => {
  return {
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...dreamData,
  };
};
```

### Type-Safe API Calls
```typescript
import { ApiResponse, Dream } from '@somni/types';

const fetchDreams = async (userId: string): Promise<ApiResponse<Dream[]>> => {
  const response = await fetch(`/api/dreams?user_id=${userId}`);
  return response.json();
};
```

### Store Usage with Types
```typescript
import { useDreamStore } from '../stores/dreamStore';
import { Dream } from '@somni/types';

const DreamComponent = () => {
  const { dreams, addDream, is_loading } = useDreamStore();
  
  const handleAddDream = (dreamData: Omit<Dream, 'id' | 'created_at' | 'updated_at'>) => {
    addDream(dreamData);
  };
  
  // Component implementation...
};
```

## Migration Guide

### From Legacy Types to New Types

**User → UserProfile**:
```typescript
// Old
const user: User = { id: 'user-123', email: 'user@example.com' };

// New
const userProfile: UserProfile = {
  id: 'user-123',
  username: 'user123',
  display_name: 'User Name',
  is_premium: false,
  onboarding_completed: true,
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z'
};
```

**DreamEntry → Dream**:
```typescript
// Old
const dreamEntry: DreamEntry = {
  id: 'dream-123',
  userId: 'user-456',
  date: '2024-01-15T10:30:00.000Z',
  title: 'Flying Dream',
  content: 'I was flying over mountains...',
  tags: ['flying', 'mountains']
};

// New
const dream: Dream = {
  id: 'dream-123',
  user_id: 'user-456',
  created_at: '2024-01-15T10:30:00.000Z',
  raw_transcript: 'I was flying over mountains...',
  refined_narrative: 'In this vivid dream, I soared above snow-capped peaks...',
  sleep_phase: 'rem',
  is_lucid: false
};
```