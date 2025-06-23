// React Native type augmentations
import 'react-native';
import { ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';

type StyleValue = ViewStyle | TextStyle | ImageStyle | undefined | null | false;

declare module 'react-native' {
  // Override StyleProp to accept arrays and functions
  type StyleProp<T> = 
    | T 
    | Array<T | undefined | null | false>
    | ((state: PressableStateCallbackType) => T | Array<T | undefined | null | false>)
    | undefined
    | null;
  
  // Augment Pressable to accept more flexible style prop
  interface PressableProps {
    style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleValue | StyleValue[]);
  }
  
  // Augment TouchableOpacity style to accept arrays
  interface TouchableOpacityProps {
    style?: StyleProp<ViewStyle>;
  }
  
  // Fix PressableStateCallbackType if needed
  interface PressableStateCallbackType {
    pressed: boolean;
    focused?: boolean;
    hovered?: boolean;
  }
}