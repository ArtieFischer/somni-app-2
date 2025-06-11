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
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sin),
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
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  );
};

export const createFadeInAnimation = (
  animatedValue: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

export const createSlideInAnimation = (
  animatedValue: Animated.Value,
  duration: number = 400,
  fromValue: number = 50
): Animated.CompositeAnimation => {
  animatedValue.setValue(fromValue);
  return Animated.spring(animatedValue, {
    toValue: 0,
    tension: 20,
    friction: 7,
    useNativeDriver: true,
  });
};

export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.back(1.5)),
    useNativeDriver: true,
  });
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

export const createLiquidAnimation = (
  animatedValue: Animated.Value,
  duration: number = 4000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ])
  );
};

export const createBreatheAnimation = (
  animatedValue: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 3000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  );
};