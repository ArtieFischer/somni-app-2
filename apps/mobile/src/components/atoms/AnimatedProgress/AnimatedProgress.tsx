import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { darkTheme } from '@somni/theme';

interface AnimatedProgressProps {
  value: number;
  duration?: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  duration = 300,
  height = 4,
  backgroundColor = darkTheme.colors.background.elevated,
  progressColor = darkTheme.colors.primary,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, duration, animatedValue]);

  const widthPercentage = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          width: widthPercentage,
          backgroundColor: progressColor,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
};