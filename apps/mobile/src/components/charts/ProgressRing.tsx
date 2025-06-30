import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  backgroundColor,
  label,
  sublabel,
  showPercentage = true,
}) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.border.primary + '30';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
        
        {/* Center text */}
        <G>
          {showPercentage && (
            <SvgText
              x={size / 2}
              y={label ? size / 2 - 5 : size / 2 + 5}
              fontSize={size / 5}
              fontWeight="bold"
              fill={theme.colors.text.primary}
              textAnchor="middle"
            >
              {Math.round(progress)}%
            </SvgText>
          )}
          
          {label && (
            <SvgText
              x={size / 2}
              y={showPercentage ? size / 2 + 15 : size / 2}
              fontSize={size / 10}
              fill={theme.colors.text.secondary}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          )}
        </G>
      </Svg>
      
      {sublabel && (
        <Text variant="caption" color="secondary" style={styles.sublabel}>
          {sublabel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
  sublabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});