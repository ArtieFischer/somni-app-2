// apps/mobile/src/stores/authStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase'; // Using the client we created
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true

  // Listens to Supabase auth changes to keep the store in sync
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
      set({ isLoading: false }); // Set loading to false after initial session check
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
      // Don't set isLoading to false here since this is for subsequent changes
    });
  },

  // A helper function to update the state
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    });
  },

  // The signOut action
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
    
    // Clear dream store data to prevent showing other users' dreams
    const { useDreamStore } = await import('@somni/stores');
    useDreamStore.getState().clearAllData();
    console.log('🧹 Cleared dream store on sign out');
  },
}));