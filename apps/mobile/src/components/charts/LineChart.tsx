import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

interface LineChartProps {
  data: Array<{
    x: string | number;
    y: number;
    label?: string;
  }>;
  height?: number;
  lineColor?: string;
  showPoints?: boolean;
  showValues?: boolean;
  fillArea?: boolean;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  minY?: number;
  maxY?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  lineColor,
  showPoints = true,
  showValues = false,
  fillArea = true,
  title,
  xAxisLabel,
  yAxisLabel,
  minY = 0,
  maxY,
}) => {
  const theme = useTheme();
  const chartWidth = screenWidth - 32;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height: chartHeight }]}>
        <Text variant="caption" color="secondary" style={styles.emptyText}>
          No data available
        </Text>
      </View>
    );
  }

  // Calculate scales
  const yMax = maxY || Math.max(...data.map(d => d.y));
  const yMin = minY;
  const yRange = yMax - yMin;
  const yScale = yRange > 0 ? innerHeight / yRange : 0;
  const xScale = innerWidth / (data.length - 1 || 1);

  // Create path
  const pathData = data.map((point, index) => {
    const x = index * xScale;
    const y = innerHeight - ((point.y - yMin) * yScale);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create area path for filling
  const areaPath = fillArea && data.length > 1 ? 
    `${pathData} L ${(data.length - 1) * xScale} ${innerHeight} L 0 ${innerHeight} Z` : '';

  // Y-axis ticks
  const yTicks = [yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax];

  // Line color
  const color = lineColor || theme.colors.primary;

  return (
    <View style={styles.container}>
      {title && (
        <Text variant="h5" style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
      
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.3} />
            <Stop offset="1" stopColor={color} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>
        
        <G x={padding.left} y={padding.top}>
          {/* Y-axis */}
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={innerHeight}
            stroke={theme.colors.border.primary}
            strokeWidth={1}
          />
          
          {/* X-axis */}
          <Line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            stroke={theme.colors.border.primary}
            strokeWidth={1}
          />
          
          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, index) => {
            const y = innerHeight - ((tick - yMin) * yScale);
            return (
              <G key={index}>
                <Line
                  x1={0}
                  y1={y}
                  x2={innerWidth}
                  y2={y}
                  stroke={theme.colors.border.primary}
                  strokeWidth={0.5}
                  opacity={0.3}
                />
                <SvgText
                  x={-10}
                  y={y + 4}
                  fontSize="10"
                  fill={theme.colors.text.secondary}
                  textAnchor="end"
                >
                  {tick.toFixed(1)}
                </SvgText>
              </G>
            );
          })}
          
          {/* Area fill */}
          {fillArea && areaPath && (
            <Path
              d={areaPath}
              fill="url(#gradient)"
            />
          )}
          
          {/* Line */}
          <Path
            d={pathData}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
          
          {/* Points and labels */}
          {data.map((point, index) => {
            const x = index * xScale;
            const y = innerHeight - ((point.y - yMin) * yScale);
            
            return (
              <G key={index}>
                {/* Point */}
                {showPoints && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    stroke={theme.colors.background.primary}
                    strokeWidth={2}
                  />
                )}
                
                {/* Value label */}
                {showValues && (
                  <SvgText
                    x={x}
                    y={y - 10}
                    fontSize="10"
                    fill={theme.colors.text.primary}
                    textAnchor="middle"
                  >
                    {point.y.toFixed(1)}
                  </SvgText>
                )}
                
                {/* X-axis label */}
                {(index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) && (
                  <SvgText
                    x={x}
                    y={innerHeight + 15}
                    fontSize="10"
                    fill={theme.colors.text.secondary}
                    textAnchor="middle"
                  >
                    {point.label || point.x}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
        
        {/* Axis labels */}
        {yAxisLabel && (
          <SvgText
            x={padding.left / 2}
            y={chartHeight / 2}
            fontSize="12"
            fill={theme.colors.text.secondary}
            textAnchor="middle"
            transform={`rotate(-90, ${padding.left / 2}, ${chartHeight / 2})`}
          >
            {yAxisLabel}
          </SvgText>
        )}
        
        {xAxisLabel && (
          <SvgText
            x={chartWidth / 2}
            y={chartHeight - 5}
            fontSize="12"
            fill={theme.colors.text.secondary}
            textAnchor="middle"
          >
            {xAxisLabel}
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80,
  },
});