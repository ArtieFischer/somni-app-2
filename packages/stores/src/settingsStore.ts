import { create } from 'zustand';

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
  
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    dreamReminders: true,
    analysisComplete: true,
    communityUpdates: false,
  },
  privacy: {
    shareAnonymously: true,
    allowDataCollection: false,
  },
  recording: {
    whisperMode: false,
    autoTranscribe: true,
    saveAudio: true,
  },
  analysis: {
    defaultLenses: ['jungian', 'spiritual'],
    autoAnalyze: false,
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,
  
  updateSettings: (updates) => {
    set(state => ({
      settings: { ...state.settings, ...updates },
      error: null,
    }));
  },
  
  setTheme: (theme) => {
    set(state => ({
      settings: { ...state.settings, theme },
      error: null,
    }));
  },
  
  setLanguage: (language) => {
    set(state => ({
      settings: { ...state.settings, language },
      error: null,
    }));
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  resetSettings: () => {
    set({ 
      settings: defaultSettings,
      error: null,
    });
  },
}));