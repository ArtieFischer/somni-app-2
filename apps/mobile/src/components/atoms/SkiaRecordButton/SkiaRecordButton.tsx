import React, { useMemo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Animated } from 'react-native';
import SomniLogoMoon from '../../../../../../assets/logo_somni_moon.svg';

import {
  Canvas,
  BlurMask,
  Paint,
  vec,
  Skia,
  Group,
  Circle,
  LinearGradient,
  RadialGradient,
} from '@shopify/react-native-skia';

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
  size = 280,
}) => {
  const [progress, setProgress] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [morph, setMorph] = useState(0);

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

  // Pulse and morph animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      const t = Date.now() * 0.001; // Convert to seconds
      setPulse(t * 2); 
      setMorph(t * 0.5); // Slower morphing
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Scale for pulse / amplitude
  const scale = useMemo(() => {
    const basePulse = 1 + Math.sin(pulse * Math.PI) * 0.03; // gentle pulse 3%
    const recordingPulse = isRecording ? 1 + amplitude * 0.12 : 1; // amplitude-based scaling when recording
    return basePulse * recordingPulse;
  }, [pulse, amplitude, isRecording]);

  const pressScale = pressed ? 0.96 : 1;

  // Button radius
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // Color interpolation using theme colors
  const outerRingColor = useMemo(() => {
    if (isRecording) {
      // Transition to ethereal teal when recording
      return `rgba(16, 185, 129, ${0.6 + 0.3 * progress})`; // #10B981
    }
    // Aurora purple glow
    return `rgba(139, 92, 246, ${0.5 + 0.2 * Math.sin(pulse)})`; // #8B5CF6
  }, [progress, isRecording, pulse]);

  const innerGlowColor = useMemo(() => {
    if (isRecording) {
      // Dream blue glow when recording
      return `rgba(96, 165, 250, ${0.4 + 0.4 * progress})`; // #60A5FA
    }
    // Mystic lavender glow
    return `rgba(167, 139, 250, ${0.3 + 0.2 * Math.sin(pulse * 1.5)})`; // #A78BFA
  }, [progress, isRecording, pulse]);


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
            {/* Morphing outer glow rings */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius + 20 + Math.sin(morph * Math.PI) * 10}
              color={outerRingColor}
              opacity={0.3}
            >
              <BlurMask blur={25} style="normal" />
            </Circle>
            
            {/* Second morphing ring */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius + 10 + Math.sin(morph * Math.PI * 1.3 + Math.PI/2) * 8}
              color={innerGlowColor}
              opacity={0.2}
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

            {/* Main gradient circle with subtle morph */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius + Math.sin(morph * Math.PI * 2) * 3}
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

            {/* Inner glow when active with morph */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.8 + Math.sin(morph * Math.PI * 1.5) * 5}
              color={innerGlowColor}
              opacity={progress * 0.8 + 0.2}
            >
              <BlurMask blur={20} style="normal" />
            </Circle>
            
            {/* Additional pulsing ring when recording */}
            {isRecording && (
              <Circle
                cx={centerX}
                cy={centerY}
                r={radius * 0.9 + amplitude * 20}
                color="rgba(96, 165, 250, 0.3)"
                opacity={amplitude}
              >
                <BlurMask blur={15} style="normal" />
              </Circle>
            )}

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
          width={100}
          height={100}
          fill="rgba(255, 255, 255, 0.9)"
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
    // Style applied separately to SVG
  },
});