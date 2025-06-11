import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from '../../atoms/Text';
import { useTheme } from '../../../hooks/useTheme';

interface UploadSuccessToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
}

export const UploadSuccessToast: React.FC<UploadSuccessToastProps> = ({
  visible,
  message,
  onHide,
  duration = 3000,
}) => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      left: theme.spacing.medium,
      right: theme.spacing.medium,
      backgroundColor: theme.colors.status.success,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderRadius: theme.borderRadius.large,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    icon: {
      marginRight: theme.spacing.small,
      fontSize: 20,
    },
    message: {
      flex: 1,
      color: theme.colors.text.inverse,
      fontWeight: '600',
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.icon}>✅</Text>
      <Text variant="body" style={styles.message}>
        {message}
      </Text>
    </Animated.View>
  );
};

// Hook to manage toast state
export const useUploadToast = () => {
  const [toastState, setToastState] = React.useState({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToastState({ visible: true, message });
  };

  const hideToast = () => {
    setToastState({ visible: false, message: '' });
  };

  return {
    toastState,
    showToast,
    hideToast,
  };
};