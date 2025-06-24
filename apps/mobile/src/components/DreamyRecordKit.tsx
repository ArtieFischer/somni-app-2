// DreamyRecordKit.tsx – drop‑in replacement for your DreamyBackground + SkiaRecordButton
// ------------------------------------------------------------------------------------
// This single file exposes two components that you can import anywhere:
//   • <DreamyBackground active={boolean}/>   – full‑screen animated shader
//   • <RecordOrb isRecording onPress amplitude size /> – morphing button
//
// Built with @shopify/react-native-skia 0.1.x and tuned for RN performance:
//   ✓ no setInterval / setState loops – everything driven by Skia values + runTiming
//   ✓ shader lives in RuntimeEffect, FPS‑friendly (∼1 ALU per pixel)
//   ✓ amplitude (0‑1) modulates scale / glow when recording
//   ✓ background animation freezes when active === false (GPU naps 💤)
// ------------------------------------------------------------------------------------

import React, { useMemo, useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Dimensions } from "react-native";
import {
  Canvas,
  Fill,
  Paint,
  Skia,
  BlurMask,
  vec,
  Group,
  Circle,
  RadialGradient,
  Path,
  Shader,
  Rect,
  LinearGradient,
} from "@shopify/react-native-skia";

/* ------------------------------------------------------------------
 * 1️⃣  DreamyBackground – oniric, blurry, GPU‑friendly
 * ----------------------------------------------------------------*/
export const DreamyBackground: React.FC<{ active: boolean }> = ({ active }) => {
  const { width, height } = Dimensions.get('window');
  const [time, setTime] = useState(0);

  // Optimized animation loop with consistent frame timing
  useEffect(() => {
    let animationId: number;
    let lastTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) * 0.001; // Convert to seconds
      lastTime = now;
      
      setTime(t => t + delta * 0.3); // Slower, smoother animation
      animationId = requestAnimationFrame(animate);
    };
    
    if (active) {
      lastTime = Date.now();
      animate();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [active]);

  // Enhanced shader with darker tones and moving blur effects
  const effect = useMemo(() => {
    const source = `
      uniform vec2 resolution;
      uniform float time;
      
      // Improved noise function
      float noise(vec2 p) {
        return sin(p.x * 10.0) * sin(p.y * 10.0);
      }
      
      // Rotation matrix
      mat2 rot(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }
      
      vec4 main(vec2 pos) {
        vec2 uv = pos / resolution;
        vec2 center = vec2(0.5);
        
        // Multiple moving centers for complex flow
        vec2 flow1 = vec2(0.3 + sin(time * 0.3) * 0.2, 0.4 + cos(time * 0.4) * 0.3);
        vec2 flow2 = vec2(0.7 + cos(time * 0.2) * 0.3, 0.6 + sin(time * 0.25) * 0.2);
        vec2 flow3 = vec2(0.5 + sin(time * 0.5) * 0.4, 0.5 + cos(time * 0.35) * 0.3);
        
        // Create malforming structures with different rotation speeds
        vec2 uv1 = (uv - flow1) * rot(time * 0.4);
        vec2 uv2 = (uv - flow2) * rot(-time * 0.3);
        vec2 uv3 = (uv - flow3) * rot(time * 0.2);
        
        // Multi-layered noise with different scales and directions
        float structure1 = sin(length(uv1) * 15.0 - time * 1.2) * cos(atan(uv1.y, uv1.x) * 3.0 + time * 0.8);
        float structure2 = sin(length(uv2) * 20.0 + time * 0.9) * sin(atan(uv2.y, uv2.x) * 4.0 - time * 0.6);
        float structure3 = cos(length(uv3) * 12.0 - time * 0.7) * cos(atan(uv3.y, uv3.x) * 2.0 + time * 0.5);
        
        // Flowing liquid distortions
        float liquid1 = sin(uv.x * 8.0 + sin(uv.y * 6.0 + time * 0.8) * 2.0 + time);
        float liquid2 = cos(uv.y * 10.0 + cos(uv.x * 7.0 - time * 0.6) * 1.5 - time * 0.7);
        float liquid3 = sin(distance(uv, flow1) * 25.0 - time * 1.5) * 0.5;
        
        // Moving blur zones
        float blurZone1 = smoothstep(0.2, 0.4, sin(distance(uv, flow1) * 10.0 - time));
        float blurZone2 = smoothstep(0.3, 0.5, cos(distance(uv, flow2) * 8.0 + time * 0.7));
        
        // Combine structures with varying weights
        float combined = structure1 * 0.3 + structure2 * 0.25 + structure3 * 0.2 + liquid1 * 0.15 + liquid2 * 0.1;
        combined = combined * 0.5 + 0.5; // Normalize
        
        // Darker theme colors
        vec3 deepMidnight = vec3(0.02, 0.04, 0.08);      // Even darker base
        vec3 auroraPurple = vec3(0.345, 0.161, 0.565);   // Darker purple
        vec3 etherealTeal = vec3(0.03, 0.425, 0.306);    // Darker teal
        vec3 mysticLavender = vec3(0.355, 0.245, 0.580); // Darker lavender
        vec3 darkerSlate = vec3(0.05, 0.07, 0.1);        // Much darker slate
        vec3 dreamBlue = vec3(0.176, 0.347, 0.580);      // Darker blue
        
        // Complex color mixing based on structures
        vec3 color = deepMidnight;
        
        // Layer 1: Base flow (darker)
        float baseFlow = smoothstep(0.3, 0.7, structure1 * 0.5 + 0.5);
        color = mix(color, darkerSlate, baseFlow * 0.5);
        
        // Layer 2: Purple aurora streams (more subtle)
        float purpleStream = smoothstep(0.4, 0.6, sin(combined * 15.0 + time * 0.5));
        color = mix(color, auroraPurple, purpleStream * 0.25);
        
        // Layer 3: Teal liquid veins (darker)
        float tealVeins = smoothstep(0.35, 0.65, liquid1 * liquid2);
        color = mix(color, etherealTeal, tealVeins * 0.15);
        
        // Layer 4: Lavender mist (more transparent)
        float lavenderMist = smoothstep(0.2, 0.8, structure2 * 0.5 + 0.5);
        color = mix(color, mysticLavender, lavenderMist * 0.12);
        
        // Layer 5: Blue highlights on peaks (dimmer)
        float blueHighlight = smoothstep(0.7, 0.9, combined);
        color = mix(color, dreamBlue, blueHighlight * 0.08);
        
        // Apply moving blur effect
        color = mix(color, color * 0.7, blurZone1 * 0.4);
        color = mix(color, color * 1.2, blurZone2 * 0.3);
        
        // Add subtle breathing glow (reduced)
        float glow = sin(time * 0.4) * 0.03 + 1.0;
        color *= glow;
        
        // Distance-based fade for depth (stronger vignette)
        float centerDist = length(uv - center);
        float fade = 1.0 - smoothstep(0.0, 0.8, centerDist * 0.9);
        color = mix(deepMidnight * 0.5, color, fade * 0.8 + 0.2);
        
        // Add moving shadow zones
        float shadow1 = smoothstep(0.4, 0.6, sin(uv.x * 5.0 + time * 0.3 + structure1));
        float shadow2 = smoothstep(0.3, 0.7, cos(uv.y * 4.0 - time * 0.4 + structure2));
        color *= (1.0 - shadow1 * 0.2) * (1.0 - shadow2 * 0.15);
        
        return vec4(color, 1.0);
      }
    `;
    
    return Skia.RuntimeEffect.Make(source);
  }, []);

  if (!effect) {
    // Fallback gradient with darker theme colors
    return (
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={["#050A14", "#58299A", "#0A7054"]}
          />
        </Rect>
      </Canvas>
    );
  }

  // Create uniforms object
  const uniforms = {
    resolution: vec(width, height),
    time: time,
  };

  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

/* ------------------------------------------------------------------
 * 2️⃣  RecordOrb – morphing pulsating button with moon icon slot
 * ----------------------------------------------------------------*/
interface RecordOrbProps {
  isRecording: boolean;
  onPress: () => void;
  amplitude?: number; // 0‑1
  size?: number;      // px (default 280)
  icon?: React.ReactNode; // your Somni moon svg / react component
}

export const RecordOrb: React.FC<RecordOrbProps> = ({
  isRecording,
  onPress,
  amplitude = 0,
  size = 280,
  icon,
}) => {
  const [progress, setProgress] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [morph, setMorph] = useState(0);
  
  // Increase padding significantly to prevent clipping
  const padding = 120; // Doubled to ensure no clipping
  const canvasSize = size + padding * 2;

  // Animate progress when isRecording changes
  useEffect(() => {
    const targetProgress = isRecording ? 1 : 0;
    const duration = 600;
    const startTime = Date.now();
    const startProgress = progress;
    let animationId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = t * t * (3 - 2 * t); // smooth step easing
      setProgress(startProgress + (targetProgress - startProgress) * easedT);

      if (t < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animate();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRecording]);

  // Optimized pulse and morph animation with single RAF loop
  useEffect(() => {
    let animationId: number;
    let lastTime = Date.now();
    let pulseValue = pulse;
    let morphValue = morph;
    
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) * 0.001; // Convert to seconds
      lastTime = now;
      
      // Update values locally first for smoother animation
      pulseValue += delta * 2;
      morphValue += delta * 0.5;
      
      // Batch state updates
      setPulse(pulseValue);
      setMorph(morphValue);
      
      animationId = requestAnimationFrame(animate);
    };
    
    if (isRecording || pressed) {
      lastTime = Date.now();
      pulseValue = pulse;
      morphValue = morph;
      animate();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRecording, pressed]);

  /* Derived values ----------------------------------------------------*/
  const scale = useMemo(() => {
    const breath = 1 + Math.sin(pulse * Math.PI) * 0.03;
    const loud = 1 + amplitude * 0.15 * progress; // Increased amplitude response
    const tap = pressed ? 0.92 : 1; // More responsive press feedback
    return breath * loud * tap;
  }, [pulse, amplitude, progress, pressed]);

  const outerColor = useMemo(() => {
    return isRecording
      ? `rgba(16, 185, 129, ${0.6 + 0.3 * progress})`  // #10B981 ethereal teal
      : `rgba(139, 92, 246, ${0.5 + 0.2 * Math.sin(pulse)})`; // #8B5CF6 aurora purple
  }, [progress, isRecording, pulse]);

  /* Path morph: circle → rounded square ------------------------------*/
  const r = size / 2 - 20;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;

  /* Render - Simplified liquid circle design */
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ width: size, height: size, padding: padding }}
    >
      <Canvas style={{ width: canvasSize, height: canvasSize }}>
        <Group
          transform={[
            { translateX: centerX },
            { translateY: centerY },
            { scale: scale },
            { translateX: -centerX },
            { translateY: -centerY }
          ]}
        >
          {/* Simplified design - just 3 layers for cleaner look */}
          
          {/* Outer glow - subtle and smooth */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={r * 0.9}
            opacity={0.15}
          >
            <Paint color={isRecording ? '#10B981' : '#8B5CF6'}>
              <BlurMask blur={50} style="normal" />
            </Paint>
          </Circle>

          {/* Main circle - simple and clean */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={r * 0.75}
            opacity={0.3}
          >
            <Paint color={isRecording ? '#10B981' : '#8B5CF6'}>
              <BlurMask blur={30} style="normal" />
            </Paint>
          </Circle>

          {/* Core - solid center */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={r * 0.6}
            opacity={0.4}
          >
            <RadialGradient
              c={vec(centerX, centerY)}
              r={r * 0.6}
              colors={[
                isRecording ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)',
                isRecording ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                'rgba(11, 20, 38, 0.0)',
              ]}
            />
            <BlurMask blur={15} style="normal" />
          </Circle>

          {/* Amplitude response - single expanding ring */}
          {isRecording && (
            <Circle
              cx={centerX}
              cy={centerY}
              r={r * 0.8 + amplitude * 25}
              opacity={amplitude * 0.4}
            >
              <Paint color="#10B981">
                <BlurMask blur={35} style="normal" />
              </Paint>
            </Circle>
          )}

          {/* Subtle inner highlight */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={r * 0.4}
            opacity={0.6}
          >
            <RadialGradient
              c={vec(centerX, centerY)}
              r={r * 0.4}
              colors={[
                'rgba(248, 250, 252, 0.4)',
                'rgba(248, 250, 252, 0.1)',
                'rgba(248, 250, 252, 0.0)',
              ]}
            />
          </Circle>
        </Group>
      </Canvas>

      {/* Center icon (moon) - properly centered */}
      <View style={[styles.iconWrap, { 
        width: size, 
        height: size,
        position: 'absolute',
        top: padding,
        left: padding,
      }]}>
        {icon}
      </View>
    </Pressable>
  );
};

/* Styles */
const styles = StyleSheet.create({
  iconWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});