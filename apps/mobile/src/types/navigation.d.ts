// Navigation type declarations
import { NavigationProp } from '@react-navigation/native';

// Augment navigation props for screens
declare global {
  interface NavigationScreenProps {
    navigation: NavigationProp<any>;
    route?: any;
  }
}