import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  type?: 'line' | 'bar';
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  width = 100,
  height = 40,
  color,
  showDots = false,
  type = 'line',
}) => {
  const theme = useTheme();
  const chartColor = color || theme.colors.primary;
  
  if (data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  if (type === 'bar') {
    const barWidth = chartWidth / data.length * 0.7;
    const spacing = chartWidth / data.length * 0.3;
    
    return (
      <View style={[styles.container, { width, height }]}>
        <Svg width={width} height={height}>
          {data.map((value, index) => {
            const barHeight = ((value - min) / range) * chartHeight;
            const x = padding + index * (barWidth + spacing) + spacing / 2;
            const y = padding + chartHeight - barHeight;
            
            return (
              <Line
                key={index}
                x1={x + barWidth / 2}
                y1={padding + chartHeight}
                x2={x + barWidth / 2}
                y2={y}
                stroke={chartColor}
                strokeWidth={barWidth}
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
        </Svg>
      </View>
    );
  }
  
  // Line chart
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y };
  });
  
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Path
          d={pathData}
          stroke={chartColor}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {showDots && points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={2}
            fill={chartColor}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});