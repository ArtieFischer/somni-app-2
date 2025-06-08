import { useEffect } from 'react';
import { useAuthStore } from '@somni/stores';
import { supabase } from '../lib/supabase';
import { UserRepository } from '../infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();

export const useAuth = () => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      authStore.setSession(session);
      
      // Fetch user profile if session exists
      if (session?.user?.id) {
        try {
          const profile = await userRepository.findById(session.user.id);
          authStore.setProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          authStore.setError('Failed to load user profile');
        }
      }
      
      authStore.setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        authStore.setSession(session);
        
        // Fetch user profile if session exists
        if (session?.user?.id) {
          try {
            const profile = await userRepository.findById(session.user.id);
            authStore.setProfile(profile);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            authStore.setError('Failed to load user profile');
          }
        } else {
          authStore.setProfile(null);
        }
        
        authStore.setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: authStore.user,
    session: authStore.session,
    profile: authStore.profile,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    signOut: authStore.signOut,
    clearError: authStore.clearError,
  };
};