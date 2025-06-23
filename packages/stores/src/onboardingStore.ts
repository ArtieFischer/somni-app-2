import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LocationAccuracy } from '@somni/types';

interface OnboardingData {
  // Personal info
  username?: string;
  sex?: 'male' | 'female' | 'other' | 'unspecified';
  birth_date?: string;
  locale?: string;
  avatarFile?: any;
  avatar_url?: string;
  dream_interpreter?: string;
  improve_sleep_quality?: string;
  interested_in_lucid_dreaming?: string;
  
  sleepSchedule?: { bedtime: string; wakeTime: string };
  dreamGoals?: string[];
  lucidityExperience?: string;
  privacy?: { defaultVisibility: 'private' | 'anonymous' };
  // Location data
  locationAccuracy?: LocationAccuracy;
  location?: { lat: number; lng: number };
  locationCountry?: string;
  locationCity?: string;
}

interface OnboardingState {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialState: OnboardingData = {};

export const useOnboardingStore = create<OnboardingState>()(
  devtools(
    (set) => ({
      data: initialState,
      updateData: (updates) =>
        set((state) => ({ data: { ...state.data, ...updates } })),
      reset: () => set({ data: initialState }),
    }),
    { name: 'OnboardingStore' }
  )
); 