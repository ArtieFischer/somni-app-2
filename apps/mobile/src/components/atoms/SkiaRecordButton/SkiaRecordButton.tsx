import React, { useMemo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Animated } from 'react-native';
import SomniLogoMoon from '../../../../../../assets/logo_somni_moon.svg';

// Conditionally import Skia to handle web
let Canvas: any, BlurMask: any, Paint: any, vec: any, Skia: any, Group: any, Circle: any, LinearGradient: any, RadialGradient: any;
try {
  const SkiaModule = require('@shopify/react-native-skia');
  Canvas = SkiaModule.Canvas;
  BlurMask = SkiaModule.BlurMask;
  Paint = SkiaModule.Paint;
  vec = SkiaModule.vec;
  Skia = SkiaModule.Skia;
  Group = SkiaModule.Group;
  Circle = SkiaModule.Circle;
  LinearGradient = SkiaModule.LinearGradient;
  RadialGradient = SkiaModule.RadialGradient;
} catch (e) {
  console.log('Skia not available, using fallback');
}

interface SkiaRecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  /** 0‑1 audio amplitude for subtle pulsation */
  amplitude?: number;
  /** Size of the button */
  size?: number;
}

export const SkiaRecordButton: React.FC<SkiaRecordButtonProps> = ({
  isRecording,
  onPress,
  amplitude = 0,
  size = 200,
}) => {
  const [progress, setProgress] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [pressed, setPressed] = useState(false);

  // Animate progress whenever state toggles
  useEffect(() => {
    const targetProgress = isRecording ? 1 : 0;
    const duration = 600;
    const startTime = Date.now();
    const startProgress = progress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = t * t * (3 - 2 * t); // smooth step easing
      setProgress(startProgress + (targetProgress - startProgress) * easedT);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [isRecording]);

  // Pulse animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setPulse(Date.now() * 0.002); // Convert to seconds
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Scale for pulse / amplitude
  const scale = useMemo(() => {
    const basePulse = 1 + Math.sin(pulse * 2 * Math.PI) * 0.02; // gentle pulse 2%
    const recordingPulse = isRecording ? 1 + amplitude * 0.08 : 1; // amplitude-based scaling when recording
    return basePulse * recordingPulse;
  }, [pulse, amplitude, isRecording]);

  const pressScale = pressed ? 0.96 : 1;

  // Button radius
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // Color interpolation for different states
  const outerRingColor = useMemo(() => {
    // From deep purple to bright red when recording
    const r = 0.15 + (0.8 - 0.15) * progress;
    const g = 0.05 + (0.1 - 0.05) * progress;
    const b = 0.25 + (0.2 - 0.25) * progress;
    const a = 0.6 + 0.2 * progress;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }, [progress]);

  const innerGlowColor = useMemo(() => {
    const r = 0.25 + (1.0 - 0.25) * progress;
    const g = 0.15 + (0.3 - 0.15) * progress;
    const b = 0.35 + (0.4 - 0.35) * progress;
    const a = 0.3 + 0.4 * progress;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }, [progress]);

  // Fallback for web without Skia - CSS-based button
  if (!Canvas || !Skia) {
    return (
      <Pressable 
        onPress={onPress} 
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[styles.container, { width: size, height: size }]}
      >
        <View style={[
          styles.fallbackButton,
          {
            width: size - 40,
            height: size - 40,
            borderRadius: (size - 40) / 2,
            backgroundColor: isRecording ? 'rgba(204, 25, 51, 0.3)' : 'rgba(38, 20, 64, 0.5)',
            transform: [{ scale: pressed ? 0.96 : scale }],
          }
        ]}>
          <View style={[
            styles.fallbackInnerCircle,
            {
              width: size - 80,
              height: size - 80,
              borderRadius: (size - 80) / 2,
              backgroundColor: isRecording ? 'rgba(204, 25, 51, 0.5)' : 'rgba(60, 40, 80, 0.7)',
            }
          ]}>
            <SomniLogoMoon width={60} height={60} style={styles.logo} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress} 
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.container, { width: size, height: size }]}
    >
      <Canvas
        style={{ width: size, height: size }}
      >
        <Group>
          {/* Main button circle with 3D effect */}
          <Group
            transform={[
              { translateX: centerX },
              { translateY: centerY },
              { scale: scale * pressScale },
              { translateX: -centerX },
              { translateY: -centerY }
            ]}
          >
            {/* Outer glow ring */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius + 15}
              color={outerRingColor}
              opacity={0.3}
            >
              <BlurMask blur={20} style="normal" />
            </Circle>

            {/* Shadow/depth circle */}
            <Circle
              cx={centerX}
              cy={centerY + 3}
              r={radius}
              color="rgba(0, 0, 0, 0.3)"
            >
              <BlurMask blur={8} style="normal" />
            </Circle>

            {/* Main gradient circle */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
            >
              <Paint>
                <RadialGradient
                  c={vec(centerX - radius * 0.3, centerY - radius * 0.3)}
                  r={radius * 1.5}
                  colors={[
                    'rgba(60, 40, 80, 0.9)',   // Lighter purple for highlight
                    'rgba(30, 15, 50, 0.7)',   // Medium purple
                    'rgba(15, 8, 30, 0.5)',    // Dark purple for depth
                  ]}
                />
              </Paint>
            </Circle>

            {/* Inner glow when active */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.8}
              color={innerGlowColor}
              opacity={progress}
            >
              <BlurMask blur={15} style="normal" />
            </Circle>

            {/* Glass reflection effect */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.6}
              opacity={0.2}
            >
              <Paint>
                <LinearGradient
                  start={vec(centerX - radius * 0.6, centerY - radius * 0.6)}
                  end={vec(centerX + radius * 0.6, centerY + radius * 0.6)}
                  colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
                />
              </Paint>
            </Circle>
          </Group>
        </Group>
      </Canvas>

      {/* Logo in the center */}
      <Animated.View style={[styles.logoContainer]}>
        <SomniLogoMoon
          width={60}
          height={60}
          style={styles.logo}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  logo: {
    tintColor: 'rgba(255, 255, 255, 0.9)',
  },
  fallbackButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fallbackInnerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});