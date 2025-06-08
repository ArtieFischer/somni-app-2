// apps/mobile/src/config/reactotron.ts
import Reactotron from 'reactotron-react-native';

// A custom monitor for Zustand stores
const zustandMonitor = <T>(store: any, name: string) => {
  // Get the initial state
  const initialState = store.getState();
  // Send the initial state to Reactotron
  Reactotron.display({
    name: `${name} - INITIAL_STATE`,
    value: initialState,
    preview: initialState ? Object.keys(initialState).join(', ') : 'No keys',
  });

  // Subscribe to state changes
  store.subscribe((state: T) => {
    // Send the updated state to Reactotron on every change
    Reactotron.display({
      name: name,
      value: state,
      preview: state ? Object.keys(state as any).join(', ') : 'No keys',
    });
  });
};

// This file should be imported in App.tsx only in __DEV__ mode
if (__DEV__) {
  Reactotron.configure({ name: 'Somni' })
    .useReactNative()
    .connect();

  // Clear Reactotron on every app refresh
  Reactotron.clear?.();

  // Make it available globally
  console.tron = Reactotron;

  // Import your stores here
  const { useAuthStore } = require('@somni/stores/authStore');
  const { useDreamStore } = require('@somni/stores/dreamStore');
  const { useSettingsStore } = require('@somni/stores/settingsStore');

  // Hook up the monitors
  zustandMonitor(useAuthStore, 'Auth Store');
  zustandMonitor(useDreamStore, 'Dream Store');
  zustandMonitor(useSettingsStore, 'Settings Store');
}

// Add a declaration for the global console.tron
declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}