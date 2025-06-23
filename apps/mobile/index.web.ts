import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import App from './App';

// For now, skip Skia web loading to test the app
// We'll add Skia support after verifying the basic app works
registerRootComponent(App);