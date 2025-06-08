import { useEffect } from 'react';
import { useAuthStore } from '@somni/stores';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      authStore.setSession(session);
      authStore.setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authStore.setSession(session);
        authStore.setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: authStore.user,
    session: authStore.session,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    signOut: authStore.signOut,
    clearError: authStore.clearError,
  };
};