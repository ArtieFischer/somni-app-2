// apps/mobile/src/config/reactotron.ts
import Reactotron from 'reactotron-react-native';
import { reactotronZustand } from 'reactotron-zustand';
import { useAuthStore } from '@somni/stores';
import { useDreamStore } from '@somni/stores';
import { useSettingsStore } from '@somni/stores';

// This file should be imported in App.tsx only in __DEV__ mode
if (__DEV__) {
  Reactotron.configure({ name: 'Somni' })
    .useReactNative()
    .use(
      reactotronZustand({
        stores: [
          { name: 'auth', store: useAuthStore },
          { name: 'dreams', store: useDreamStore },
          { name: 'settings', store: useSettingsStore },
        ],
      }),
    )
    .connect();

  // Clear Reactotron on every app refresh
  Reactotron.clear?.();

  console.log = Reactotron.log; // Redirect console.log to Reactotron
  console.tron = Reactotron; // Make it available globally
}

// Add a declaration for the global console.tron
declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}