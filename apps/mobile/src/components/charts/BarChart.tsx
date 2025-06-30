import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    secondaryValue?: number;
  }>;
  height?: number;
  barColor?: string;
  secondaryBarColor?: string;
  showValues?: boolean;
  maxValue?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  barColor,
  secondaryBarColor,
  showValues = false,
  maxValue,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  const theme = useTheme();
  const chartWidth = screenWidth - 32; // Account for padding
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate max value if not provided
  const dataMax = maxValue || Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)));
  const yScale = dataMax > 0 ? innerHeight / dataMax : 0;

  // Bar dimensions
  const barWidth = innerWidth / (data.length * 2); // Leave space between bars
  const barSpacing = barWidth / 2;

  // Colors
  const primaryColor = barColor || theme.colors.primary;
  const secondaryColor = secondaryBarColor || theme.colors.secondary;

  // Y-axis tick values
  const yTicks = [0, dataMax * 0.25, dataMax * 0.5, dataMax * 0.75, dataMax];

  return (
    <View style={styles.container}>
      {title && (
        <Text variant="h5" style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
      )}
      
      <Svg width={chartWidth} height={chartHeight}>
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
          
          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, index) => {
            const y = innerHeight - (tick * yScale);
            return (
              <G key={index}>
                <Line
                  x1={-5}
                  y1={y}
                  x2={0}
                  y2={y}
                  stroke={theme.colors.border.primary}
                  strokeWidth={1}
                />
                <SvgText
                  x={-10}
                  y={y + 4}
                  fontSize="10"
                  fill={theme.colors.text.secondary}
                  textAnchor="end"
                >
                  {Math.round(tick)}
                </SvgText>
              </G>
            );
          })}
          
          {/* Bars */}
          {data.map((item, index) => {
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const barHeight = item.value * yScale;
            const y = innerHeight - barHeight;
            
            return (
              <G key={index}>
                {/* Primary bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={primaryColor}
                  rx={2}
                  opacity={0.8}
                />
                
                {/* Secondary bar (if exists) */}
                {item.secondaryValue !== undefined && (
                  <Rect
                    x={x}
                    y={innerHeight - (item.secondaryValue * yScale)}
                    width={barWidth}
                    height={item.secondaryValue * yScale}
                    fill={secondaryColor}
                    rx={2}
                    opacity={0.5}
                  />
                )}
                
                {/* Value label */}
                {showValues && item.value > 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize="10"
                    fill={theme.colors.text.primary}
                    textAnchor="middle"
                  >
                    {item.value}
                  </SvgText>
                )}
                
                {/* X-axis label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={innerHeight + 15}
                  fontSize="10"
                  fill={theme.colors.text.secondary}
                  textAnchor="middle"
                  transform={`rotate(${data.length > 12 ? -45 : 0}, ${x + barWidth / 2}, ${innerHeight + 15})`}
                >
                  {item.label}
                </SvgText>
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
});