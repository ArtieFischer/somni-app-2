import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseClient } from '../infrastructure/api/supabase/client';

export const clearAllCache = async () => {
  try {
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    
    // Sign out from Supabase to clear session
    await supabaseClient.auth.signOut();
    
    console.log('✅ All cache cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

export const clearDreamCache = async () => {
  try {
    // Clear dream store data
    await AsyncStorage.removeItem('somni-dream-store');
    console.log('✅ Dream cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing dream cache:', error);
    return false;
  }
};

export const clearOfflineQueue = async () => {
  try {
    // Clear offline queue data
    await AsyncStorage.removeItem('somni-offline-queue-store');
    console.log('✅ Offline queue cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing offline queue:', error);
    return false;
  }
};