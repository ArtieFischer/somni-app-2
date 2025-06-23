// Store type augmentations
import '@somni/stores';

declare module '@somni/stores' {
  // Augment store types that may be missing methods
  interface AuthStore {
    setSession?: (session: any) => void;
    clearSession?: () => void;
  }
  
  interface DreamStore {
    fetchDreams?: () => Promise<void>;
    updateDream?: (id: string, updates: Partial<Dream>) => void;
    deleteDream?: (id: string) => Promise<void>;
  }
}