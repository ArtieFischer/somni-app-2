import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Text } from '../Text';
import {
  createPulseAnimation,
  createRotationAnimation,
  createWaveAnimation,
} from '../../../utils/animations';
import { useTheme } from '../../../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_SIZE = 180;

interface MorphingRecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  amplitude?: number; // 0-1 value from audio input
}

export const MorphingRecordButton: React.FC<MorphingRecordButtonProps> = ({
  isRecording,
  onPress,
  amplitude = 0,
}) => {
  const theme = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Waveform layers animations
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const wave4Anim = useRef(new Animated.Value(0)).current;

  // Morphing animations
  const morphAnim = useRef(new Animated.Value(0)).current;
  const amplitudeAnim = useRef(new Animated.Value(0)).current;

  // Animation refs to stop them
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Stop all previous animations
    animationRefs.current.forEach(anim => anim.stop());
    animationRefs.current = [];

    if (isRecording) {
      // Start all animations
      const animations = [
        createPulseAnimation(pulseAnim, 1.1, 2000),
        createRotationAnimation(rotateAnim, 30000),
        createWaveAnimation(wave1Anim, 0, 3000),
        createWaveAnimation(wave2Anim, 300, 3200),
        createWaveAnimation(wave3Anim, 600, 3400),
        createWaveAnimation(wave4Anim, 900, 3600),
      ];

      animations.forEach(anim => {
        animationRefs.current.push(anim);
        anim.start();
      });

      // Morph to recording state
      Animated.spring(morphAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      // Stop animations and reset
      Animated.parallel([
        Animated.spring(morphAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset animation values
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      wave1Anim.setValue(0);
      wave2Anim.setValue(0);
      wave3Anim.setValue(0);
      wave4Anim.setValue(0);
    }

    return () => {
      // Cleanup animations on unmount
      animationRefs.current.forEach(anim => anim.stop());
    };
  }, [isRecording]);

  // Update amplitude animation
  useEffect(() => {
    Animated.timing(amplitudeAnim, {
      toValue: amplitude,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [amplitude, amplitudeAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      width: screenWidth,
      height: screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waveformContainer: {
      position: 'absolute',
      width: screenWidth,
      height: screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waveformLayer: {
      position: 'absolute',
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    buttonWrapper: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: isRecording 
        ? theme.colors.primary 
        : theme.colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isRecording ? 0 : 3,
      borderColor: theme.colors.primary,
      ...theme.shadows.large,
      overflow: 'hidden',
    },
    buttonPressed: {
      opacity: 0.9,
    },
    gradientLayer1: {
      position: 'absolute',
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: theme.colors.accent,
      opacity: 0.3,
    },
    gradientLayer2: {
      position: 'absolute',
      width: BUTTON_SIZE * 0.8,
      height: BUTTON_SIZE * 0.8,
      borderRadius: (BUTTON_SIZE * 0.8) / 2,
      backgroundColor: theme.colors.secondary,
      opacity: 0.2,
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    micIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    micEmoji: {
      fontSize: 40,
    },
    stopIcon: {
      width: 30,
      height: 30,
      backgroundColor: theme.colors.text.inverse,
      borderRadius: 4,
    },
    recordingDot: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#FF0000',
    },
  });

  const renderWaveformLayers = () => {
    const layers = [
      { anim: wave1Anim, scale: 1.2, opacity: 0.3, color: theme.colors.accent },
      { anim: wave2Anim, scale: 1.4, opacity: 0.25, color: theme.colors.primary },
      { anim: wave3Anim, scale: 1.6, opacity: 0.2, color: theme.colors.secondary },
      { anim: wave4Anim, scale: 1.8, opacity: 0.15, color: theme.colors.accent },
    ];

    return layers.map((layer, index) => {
      const waveScale = Animated.add(
        layer.anim,
        Animated.multiply(amplitudeAnim, 0.5)
      );

      const scale = Animated.multiply(
        Animated.add(layer.scale, waveScale),
        morphAnim
      );

      return (
        <Animated.View
          key={index}
          style={[
            styles.waveformLayer,
            {
              transform: [
                { scale },
                { rotate: rotateInterpolate },
              ],
              opacity: Animated.multiply(layer.opacity, morphAnim),
              borderColor: layer.color,
            },
          ]}
        />
      );
    });
  };

  const buttonScale = Animated.add(
    1,
    Animated.multiply(
      Animated.subtract(pulseAnim, 1),
      Animated.subtract(1, morphAnim)
    )
  );

  return (
    <View style={styles.container}>
      {/* Waveform layers - behind the button */}
      <View style={styles.waveformContainer}>
        {renderWaveformLayers()}
      </View>

      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: buttonScale },
            ],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onPress}
        >
          {/* Gradient overlay layers */}
          <Animated.View
            style={[
              styles.gradientLayer1,
              {
                opacity: morphAnim,
                transform: [
                  { scale: Animated.add(1, Animated.multiply(amplitudeAnim, 0.2)) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.gradientLayer2,
              {
                opacity: Animated.multiply(morphAnim, 0.7),
                transform: [
                  { scale: Animated.add(1, Animated.multiply(amplitudeAnim, 0.3)) },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          />

          {/* Center content */}
          <Animated.View
            style={[
              styles.centerContent,
              {
                opacity: Animated.subtract(1, Animated.multiply(morphAnim, 0.3)),
              },
            ]}
          >
            <View style={styles.iconContainer}>
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <View style={styles.micIcon}>
                  <Text style={styles.micEmoji}>🎙️</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Recording indicator */}
          {isRecording && (
            <Animated.View
              style={[
                styles.recordingDot,
                {
                  opacity: pulseAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};