import { create } from 'zustand';
import { Dream } from '@somni/types';

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
  setCurrentDream: (dream: Dream | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<DreamFilters>) => void;
  clearError: () => void;
  
  // Recording actions
  startRecording: () => void;
  stopRecording: () => void;
  setRecordingSession: (session: RecordingSession | null) => void;
  updateRecordingSession: (updates: Partial<RecordingSession>) => void;
  setRecordingDuration: (duration: number) => void;
  setRecordingAmplitude: (amplitude: number) => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  // Initial state
  dreams: [],
  currentDream: null,
  isLoading: false,
  error: null,
  filters: {},
  
  recordingSession: null,
  isRecording: false,
  recordingDuration: 0,
  recordingAmplitude: 0,
  
  // Dream actions
  setDreams: (dreams) => {
    set({ dreams, error: null });
  },
  
  addDream: (dream) => {
    set(state => ({
      dreams: [dream, ...state.dreams],
      error: null,
    }));
  },
  
  updateDream: (id, updates) => {
    set(state => ({
      dreams: state.dreams.map(dream => 
        dream.id === id ? { ...dream, ...updates } : dream
      ),
      currentDream: state.currentDream?.id === id 
        ? { ...state.currentDream, ...updates }
        : state.currentDream,
      error: null,
    }));
  },
  
  deleteDream: (id) => {
    set(state => ({
      dreams: state.dreams.filter(dream => dream.id !== id),
      currentDream: state.currentDream?.id === id ? null : state.currentDream,
      error: null,
    }));
  },
  
  setCurrentDream: (dream) => {
    set({ currentDream: dream });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Recording actions
  startRecording: () => {
    const session: RecordingSession = {
      id: `recording-${Date.now()}`,
      status: 'recording',
      startTime: new Date().toISOString(),
    };
    
    set({
      recordingSession: session,
      isRecording: true,
      recordingDuration: 0,
      recordingAmplitude: 0,
      error: null,
    });
  },
  
  stopRecording: () => {
    set(state => ({
      recordingSession: state.recordingSession ? {
        ...state.recordingSession,
        status: 'processing',
        endTime: new Date().toISOString(),
      } : null,
      isRecording: false,
    }));
  },
  
  setRecordingSession: (session) => {
    set({ 
      recordingSession: session,
      isRecording: session?.status === 'recording',
    });
  },
  
  updateRecordingSession: (updates) => {
    set(state => ({
      recordingSession: state.recordingSession ? {
        ...state.recordingSession,
        ...updates,
      } : null,
    }));
  },
  
  setRecordingDuration: (duration) => {
    set({ recordingDuration: duration });
  },
  
  setRecordingAmplitude: (amplitude) => {
    set({ recordingAmplitude: amplitude });
  },
}));