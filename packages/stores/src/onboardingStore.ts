import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface OnboardingData {
  sleepSchedule?: { bedtime: string; wakeTime: string };
  dreamGoals?: string[];
  lucidityExperience?: string;
  privacy?: { defaultVisibility: 'private' | 'anonymous' };
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