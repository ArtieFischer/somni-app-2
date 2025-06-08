// Corresponds to the 'users_profile' table
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
}

export type SleepPhase = 'rem' | 'nrem' | 'light' | 'deep' | 'awake';

// Corresponds to the 'dreams' table
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

// Legacy interfaces for backward compatibility
// TODO: Remove these once all code is migrated to new interfaces
export interface User {
  id: string;
  email?: string;
}

export interface DreamEntry {
  id: string;
  userId: string;
  date: string; // ISO Date string
  title: string;
  content: string;
  interpretation?: string;
  tags?: string[];
}