/**
 * Debug helpers for development
 * These functions can be called from the React Native debugger console
 */

import { clearAllAppCache, clearDreamCache, clearOfflineQueue, forceRefreshProfile, getCacheInfo } from './clearAppCache';

// Make these functions globally available in development
if (__DEV__) {
  (global as any).debugClearAllCache = async () => {
    console.log('🧹 Clearing all app cache...');
    try {
      await clearAllAppCache();
      console.log('✅ Cache cleared! App will need to restart.');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  };

  (global as any).debugClearDreams = async () => {
    console.log('🧹 Clearing dream cache...');
    try {
      await clearDreamCache();
      console.log('✅ Dream cache cleared!');
    } catch (error) {
      console.error('❌ Failed to clear dream cache:', error);
    }
  };

  (global as any).debugClearOfflineQueue = async () => {
    console.log('🧹 Clearing offline queue...');
    try {
      await clearOfflineQueue();
      console.log('✅ Offline queue cleared!');
    } catch (error) {
      console.error('❌ Failed to clear offline queue:', error);
    }
  };

  (global as any).debugRefreshProfile = async () => {
    console.log('🔄 Force refreshing profile...');
    try {
      await forceRefreshProfile();
      console.log('✅ Profile refreshed!');
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error);
    }
  };

  (global as any).debugGetCacheInfo = async () => {
    console.log('📊 Getting cache info...');
    try {
      const info = await getCacheInfo();
      console.log('Cache Info:', info);
      return info;
    } catch (error) {
      console.error('❌ Failed to get cache info:', error);
    }
  };

  console.log(`
🛠️  Debug helpers loaded! Available commands:
- debugClearAllCache() - Clear all app cache and sign out
- debugClearDreams() - Clear only dream cache
- debugClearOfflineQueue() - Clear offline upload queue
- debugRefreshProfile() - Force refresh user profile from database
- debugGetCacheInfo() - Get information about cached data
  `);
}

export {};