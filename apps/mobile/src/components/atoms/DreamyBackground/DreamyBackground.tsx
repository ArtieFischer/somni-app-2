import React, { useMemo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Conditionally import Skia to handle web
let Canvas: any, BlurMask: any, Fill: any, Paint: any, vec: any, Skia: any, RuntimeShader: any;
try {
  const SkiaModule = require('@shopify/react-native-skia');
  Canvas = SkiaModule.Canvas;
  BlurMask = SkiaModule.BlurMask;
  Fill = SkiaModule.Fill;
  Paint = SkiaModule.Paint;
  vec = SkiaModule.vec;
  Skia = SkiaModule.Skia;
  RuntimeShader = SkiaModule.RuntimeShader;
} catch (e) {
  console.log('Skia not available, using fallback');
}

interface DreamyBackgroundProps {
  /** set to true while mic is recording → background starts breathing */
  active: boolean;
}

export const DreamyBackground: React.FC<DreamyBackgroundProps> = ({ active }) => {
  const [time, setTime] = useState(0);

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

  /* GLSL‑like Skia RuntimeEffect (3D simplex noise)
   * Tip: keep code tiny – heavy math can hurt low‑end devices.
   */
  const effect = useMemo(() => {
    const src = `
      uniform float u_time;
      uniform float2 u_res;
      half4 main(float2 fragCoord) {
        float2 uv = fragCoord / u_res;
        
        // Create flowing noise patterns
        float n1 = sin(uv.x * 4.0 + u_time * 0.3) * cos(uv.y * 3.0 + u_time * 0.2);
        float n2 = sin((uv.x + uv.y) * 5.0 + u_time * 0.4) * 0.6;
        float n3 = cos(uv.x * 2.0 - u_time * 0.1) * sin(uv.y * 6.0 + u_time * 0.5) * 0.3;
        
        float noise = (n1 + n2 + n3) * 0.5 + 0.5;
        noise = smoothstep(0.2, 0.8, noise);
        
        // Create depth with multiple layers
        float depth = length(uv - 0.5);
        float vignette = 1.0 - smoothstep(0.3, 1.2, depth);
        
        // Color palette (deep purple → midnight blue → wine red)
        half3 color1 = half3(0.08, 0.05, 0.20); // Deep purple base
        half3 color2 = half3(0.02, 0.08, 0.25); // Midnight blue
        half3 color3 = half3(0.18, 0.02, 0.12); // Wine red accents
        half3 color4 = half3(0.05, 0.02, 0.15); // Dark purple
        
        // Mix colors based on noise and position
        half3 col = mix(color1, color2, noise);
        col = mix(col, color3, noise * noise * 0.7);
        col = mix(col, color4, vignette * 0.3);
        
        // Add subtle brightness variation
        col *= (0.7 + 0.3 * noise * vignette);
        
        return half4(col, 1.0);
      }`;
    return Skia.RuntimeEffect.Make(src)!;
  }, []);

  // Fallback for web without Skia
  if (!Canvas || !Skia) {
    return (
      <View style={[
        StyleSheet.absoluteFill, 
        { 
          backgroundColor: active ? '#1a0f2e' : '#0a051a',
          opacity: 0.9,
        }
      ]} />
    );
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* Full‑screen rect with custom shader */}
      <Fill>
        <Paint>
          <RuntimeShader source={effect} uniforms={{
            u_time: time,
            u_res: vec(400, 800), // Default values, will be updated
          }} />
          {/* Soft blur mask for dreamy feel */}
          <BlurMask blur={active ? 32 : 16} style="normal" />
        </Paint>
      </Fill>
    </Canvas>
  );
};