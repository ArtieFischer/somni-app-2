import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDreamStore } from '@somni/stores';
import { useOfflineQueueStore } from '@somni/stores';
import { useAuthStore } from '@somni/stores';
import { supabase } from '../lib/supabase';

/**
 * Clears all cached data from the app including:
 * - All AsyncStorage data
 * - Dream store
 * - Offline queue store
 * - Auth session
 * - Language preferences
 */
export const clearAllAppCache = async (): Promise<void> => {
  try {
    console.log('🧹 Starting complete cache clear...');

    // Clear all AsyncStorage data
    console.log('📦 Clearing AsyncStorage...');
    await AsyncStorage.clear();

    // Clear Zustand stores
    console.log('💭 Clearing dream store...');
    useDreamStore.getState().clearAllData();

    console.log('📤 Clearing offline queue...');
    useOfflineQueueStore.getState().clearAllRecordings();

    // Sign out from Supabase (this will also clear the session from AsyncStorage)
    console.log('🔐 Signing out from Supabase...');
    await supabase.auth.signOut();

    // Clear auth store
    console.log('👤 Clearing auth store...');
    useAuthStore.getState().signOut();

    console.log('✅ All cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    throw error;
  }
};

/**
 * Forces a refresh of the user profile from the database
 * This bypasses any cached profile data
 */
export const forceRefreshProfile = async (): Promise<void> => {
  try {
    console.log('🔄 Force refreshing user profile...');
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      // Clear auth store profile
      useAuthStore.getState().setProfile(null);
      
      // Force reload profile from database
      const { UserRepository } = await import('../infrastructure/repositories/UserRepository');
      const userRepository = new UserRepository();
      
      const profile = await userRepository.findById(session.user.id);
      
      if (profile) {
        useAuthStore.getState().setProfile(profile);
        console.log('✅ Profile refreshed:', profile);
      } else {
        console.log('⚠️ No profile found in database');
      }
    } else {
      console.log('⚠️ No active session');
    }
  } catch (error) {
    console.error('❌ Error refreshing profile:', error);
    throw error;
  }
};

/**
 * Clears only dream-related cached data
 */
export const clearDreamCache = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing dream cache...');

    // Clear dream store
    useDreamStore.getState().clearAllData();

    // Clear specific AsyncStorage keys for dreams
    await AsyncStorage.removeItem('somni-dream-store');

    console.log('✅ Dream cache cleared');
  } catch (error) {
    console.error('❌ Error clearing dream cache:', error);
    throw error;
  }
};

/**
 * Clears only offline queue data
 */
export const clearOfflineQueue = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing offline queue...');

    // Clear offline queue store
    useOfflineQueueStore.getState().clearAllRecordings();

    // Clear specific AsyncStorage keys for offline queue
    await AsyncStorage.removeItem('somni-offline-queue-store');

    console.log('✅ Offline queue cleared');
  } catch (error) {
    console.error('❌ Error clearing offline queue:', error);
    throw error;
  }
};

/**
 * Lists all AsyncStorage keys (for debugging)
 */
export const listAllStorageKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 All AsyncStorage keys:', keys);
    return keys;
  } catch (error) {
    console.error('❌ Error listing storage keys:', error);
    return [];
  }
};

/**
 * Gets the size of cached data
 */
export const getCacheInfo = async (): Promise<{
  totalKeys: number;
  keys: string[];
  dreamStoreSize: number;
  offlineQueueSize: number;
}> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const dreamState = useDreamStore.getState();
    const queueState = useOfflineQueueStore.getState();

    return {
      totalKeys: keys.length,
      keys,
      dreamStoreSize: dreamState.dreams.length,
      offlineQueueSize: queueState.recordings.length,
    };
  } catch (error) {
    console.error('❌ Error getting cache info:', error);
    return {
      totalKeys: 0,
      keys: [],
      dreamStoreSize: 0,
      offlineQueueSize: 0,
    };
  }
};