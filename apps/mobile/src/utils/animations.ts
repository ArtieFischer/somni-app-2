import { Animated, Easing } from 'react-native';

export const createPulseAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1.2,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
    ])
  );
};

export const createRotationAnimation = (
  animatedValue: Animated.Value,
  duration: number = 20000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

export const createWaveAnimation = (
  animatedValue: Animated.Value,
  delay: number = 0,
  duration: number = 2000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
    ])
  );
};

export const interpolateColor = (
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: string[]
): Animated.AnimatedInterpolation => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};