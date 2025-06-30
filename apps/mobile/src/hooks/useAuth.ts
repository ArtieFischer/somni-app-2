import { useEffect } from 'react';
import { useAuthStore, useDreamStore } from '@somni/stores';
import { supabase } from '../lib/supabase';
import { UserRepository } from '../infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();

export const useAuth = () => {
  const authStore = useAuthStore();
  const dreamStore = useDreamStore();
  

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const previousUserId = authStore.session?.user?.id;
      const newUserId = session?.user?.id;
      
      // Check if user has changed on initial load
      if (previousUserId !== newUserId && previousUserId !== undefined) {
        // Clear dream data when user changes to prevent showing other users' dreams
        dreamStore.clearAllData();
        console.log('🧹 Cleared dream data due to user change on init');
      }
      
      authStore.setSession(session);
      
      // Fetch user profile if session exists
      if (session?.user?.id) {
        try {
          const profile = await userRepository.findById(session.user.id);
          console.log('🔍 Fetched profile from database:', profile);
          authStore.setProfile(profile);
        } catch (error: any) {
          console.error('Failed to fetch user profile:', error);
          // Don't set error for missing profile - it will be created when needed
          if (error?.message?.includes('not found')) {
            console.log('📝 Profile not found - will be created on first dream recording');
          } else {
            authStore.setError('Failed to load user profile');
          }
        }
      }
      
      authStore.setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const previousUserId = authStore.session?.user?.id;
        const newUserId = session?.user?.id;
        
        // Check if user has changed (including login from null)
        if (previousUserId !== newUserId) {
          // Clear dream data when user changes to prevent showing other users' dreams
          dreamStore.clearAllData();
          console.log('🧹 Cleared dream data due to user change');
        }
        
        authStore.setSession(session);
        
        // Fetch user profile if session exists
        if (session?.user?.id) {
          try {
            const profile = await userRepository.findById(session.user.id);
            // console.log('🔍 Fetched profile from database (auth state change):', profile);
            authStore.setProfile(profile);
          } catch (error: any) {
            console.error('Failed to fetch user profile:', error);
            // Don't set error for missing profile - it will be created when needed
            if (error?.message?.includes('not found')) {
              console.log('📝 Profile not found - will be created on first dream recording');
            } else {
              authStore.setError('Failed to load user profile');
            }
          }
        } else {
          // User logged out - clear profile
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