import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '@somni/types';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      error: null,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      // The actual signOut will be handled by the infrastructure layer
      set({
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));