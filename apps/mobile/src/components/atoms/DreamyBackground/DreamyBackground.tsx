import React, { useMemo, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

import {
  Canvas,
  BlurMask,
  Fill,
  Paint,
  vec,
  Skia,
  Shader,
  rect,
} from '@shopify/react-native-skia';

interface DreamyBackgroundProps {
  /** set to true while mic is recording → background starts breathing */
  active: boolean;
}

export const DreamyBackground: React.FC<DreamyBackgroundProps> = ({ active }) => {
  const [time, setTime] = useState(0);
  const { width, height } = Dimensions.get('window');

  // Update time when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active) {
      interval = setInterval(() => {
        setTime(prev => prev + 0.016); // ~60fps
      }, 16);
    } else {
      setTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active]);

  /* Enhanced GLSL shader with theme colors and more complex patterns */
  const effect = useMemo(() => {
    const src = `
      uniform float u_time;
      uniform float2 u_res;
      uniform float u_active;
      
      // Simple noise function
      float noise(float2 p) {
        return sin(p.x * 10.0) * sin(p.y * 10.0);
      }
      
      // Fractal brownian motion for organic movement
      float fbm(float2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      half4 main(float2 fragCoord) {
        float2 uv = fragCoord / u_res;
        float2 center = float2(0.5, 0.5);
        
        // Create morphing aurora-like patterns
        float t = u_time * 0.15;
        float2 p = uv - center;
        float angle = atan(p.y, p.x);
        float radius = length(p);
        
        // Multiple wave layers
        float wave1 = sin(angle * 3.0 + t) * 0.1;
        float wave2 = sin(angle * 5.0 - t * 1.3) * 0.08;
        float wave3 = cos(angle * 7.0 + t * 0.7) * 0.06;
        
        // Combine waves with radial modulation
        float pattern = (wave1 + wave2 + wave3) * (1.0 - radius * 0.8);
        pattern += fbm(uv * 3.0 + float2(t * 0.1, -t * 0.15)) * 0.3;
        
        // Animated noise layers
        float n1 = sin(uv.x * 6.0 + t * 0.8) * cos(uv.y * 4.0 + t * 0.6);
        float n2 = sin((uv.x - uv.y) * 8.0 + t) * 0.5;
        float n3 = fbm(uv * 5.0 + float2(sin(t * 0.3), cos(t * 0.2)));
        
        float noise = (n1 + n2 + n3) * 0.3 + 0.5;
        noise = smoothstep(0.3, 0.7, noise + pattern);
        
        // Radial gradient for depth
        float vignette = 1.0 - smoothstep(0.2, 1.0, radius * 1.2);
        float innerGlow = exp(-radius * 3.0) * u_active;
        
        // Theme colors from dark.ts
        half3 deepMidnight = half3(0.043, 0.078, 0.149);  // #0B1426
        half3 auroraPurple = half3(0.545, 0.361, 0.965);  // #8B5CF6
        half3 mysticLavender = half3(0.655, 0.545, 0.980); // #A78BFA
        half3 etherealTeal = half3(0.063, 0.725, 0.506);  // #10B981
        half3 dreamBlue = half3(0.376, 0.647, 0.980);     // #60A5FA
        
        // Color mixing based on patterns and state
        half3 col = deepMidnight;
        col = mix(col, auroraPurple, noise * 0.4 * vignette);
        col = mix(col, mysticLavender, pattern * 0.6);
        col = mix(col, etherealTeal, innerGlow * 0.3);
        col = mix(col, dreamBlue, u_active * noise * 0.2);
        
        // Add shimmer effect
        float shimmer = sin(uv.x * 40.0 + t * 5.0) * sin(uv.y * 40.0 - t * 3.0);
        shimmer = smoothstep(0.8, 1.0, shimmer) * 0.1 * u_active;
        col += half3(shimmer);
        
        // Breathing effect when active
        float breath = sin(t * 2.0) * 0.1 + 1.0;
        col *= mix(1.0, breath, u_active);
        
        return half4(col, 1.0);
      }`;
    return Skia.RuntimeEffect.Make(src)!;
  }, []);


  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* Full‑screen rect with custom shader */}
      <Fill>
        <Paint>
          <Shader source={effect} uniforms={{
            u_time: time,
            u_res: vec(width, height),
            u_active: active ? 1.0 : 0.0,
          }} />
          {/* Soft blur mask for dreamy feel */}
          <BlurMask blur={active ? 32 : 16} style="normal" />
        </Paint>
      </Fill>
    </Canvas>
  );
};