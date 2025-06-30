import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import Reanimated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence,
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { GuideType } from '../../../config/guideConfigs';
import { styles } from './GuideAvatar.styles';

interface GuideAvatarProps {
  guideType: GuideType;
  guideName: string;
  isActive: boolean;
  isConnected: boolean;
}

const guideImages: Record<GuideType, any> = {
  jung: require('../../../../../../assets/guides/jung-avatar.png'),
  freud: require('../../../../../../assets/guides/freud-avatar.png'),
  mary: require('../../../../../../assets/guides/mary-avatar.png'),
  lakshmi: require('../../../../../../assets/guides/lakshmi-avatar.png'),
};

export const GuideAvatar: React.FC<GuideAvatarProps> = ({
  guideType,
  guideName,
  isActive,
  isConnected,
}) => {
  // Animation value for breathing effect
  const scaleAnimation = useSharedValue(1);

  useEffect(() => {
    if (isActive && isConnected) {
      // Start breathing animation when agent is speaking
      scaleAnimation.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      // Reset to normal scale
      scaleAnimation.value = withTiming(1, { duration: 500 });
    }
  }, [isActive, isConnected, scaleAnimation]);

  // Animated style for the circle background
  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleAnimation.value,
      [1, 1.1],
      [1, 1.1]
    );
    
    return {
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated circle background */}
      <Reanimated.View style={[styles.circleBackground, animatedCircleStyle]} />
      
      {/* Guide avatar image */}
      <View style={styles.avatarContainer}>
        <Image
          source={guideImages[guideType]}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};