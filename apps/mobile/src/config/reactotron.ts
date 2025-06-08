import Reactotron from 'reactotron-react-native';
import { StoreApi } from 'zustand';

// A custom monitor for Zustand stores that we can reuse
const zustandMonitor = <T extends object>(store: StoreApi<T>, name: string) => {
  // Get initial state
  const initialState = store.getState();
  Reactotron.display({
    name: `${name} - INITIAL STATE`,
    value: initialState,
    preview: initialState ? Object.keys(initialState).join(', ') : 'No keys',
  });

  // Subscribe to all state changes
  store.subscribe((state: T) => {
    Reactotron.display({
      name: name.toUpperCase(),
      value: state,
      preview: state ? Object.keys(state).join(', ') : 'No keys',
    });
  });
};

// This file is imported in App.tsx, but only in __DEV__ mode
if (__DEV__) {
  Reactotron.configure({ name: 'Somni' })
    .useReactNative()
    .connect();

  // Clear Reactotron on every app refresh
  Reactotron.clear?.();

  // Make it available on the global console for easy access
  console.tron = Reactotron;

  // Dynamically require stores to avoid circular dependencies
  const { useAuthStore } = require('@somni/stores/authStore');
  const { useDreamStore } = require('@somni/stores/dreamStore');
  const { useSettingsStore } = require('@somni/stores/settingsStore');

  // Hook up the monitors to our stores
  zustandMonitor(useAuthStore, 'Auth Store');
  zustandMonitor(useDreamStore, 'Dream Store');
  zustandMonitor(useSettingsStore, 'Settings Store');
}

// Add a TypeScript declaration for our new global `console.tron`
declare global {
  interface Console {
    tron: typeof Reactotron;
  }
} 