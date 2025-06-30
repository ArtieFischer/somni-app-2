import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Text as SvgText, G, Circle } from 'react-native-svg';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  size?: number;
  innerRadius?: number; // For donut chart
  showLabels?: boolean;
  showPercentages?: boolean;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = Math.min(screenWidth - 64, 250),
  innerRadius = 0,
  showLabels = true,
  showPercentages = true,
  title,
}) => {
  const theme = useTheme();
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  const labelRadius = radius * 0.7;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <View style={[styles.container, { height: size }]}>
        <Text variant="caption" color="secondary" style={styles.emptyText}>
          No data available
        </Text>
      </View>
    );
  }

  // Default colors
  const defaultColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.status.success,
    theme.colors.status.warning,
    theme.colors.status.error,
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F59E0B',
    '#EF4444',
  ];

  // Calculate angles
  let currentAngle = -Math.PI / 2; // Start from top
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percentage * 2 * Math.PI);
    currentAngle = endAngle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: item.color || defaultColors[index % defaultColors.length],
    };
  });

  // Create path for segment
  const createPath = (startAngle: number, endAngle: number) => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    
    if (innerRadius > 0) {
      // Donut chart
      const ix1 = centerX + innerRadius * Math.cos(startAngle);
      const iy1 = centerY + innerRadius * Math.sin(startAngle);
      const ix2 = centerX + innerRadius * Math.cos(endAngle);
      const iy2 = centerY + innerRadius * Math.sin(endAngle);
      
      return `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix2} ${iy2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}
        Z
      `;
    } else {
      // Pie chart
      return `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text variant="h5" style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}
      
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {segments.map((segment, index) => {
            const midAngle = (segment.startAngle + segment.endAngle) / 2;
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);
            
            return (
              <G key={index}>
                {/* Segment */}
                <Path
                  d={createPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  stroke={theme.colors.background.primary}
                  strokeWidth={2}
                />
                
                {/* Label */}
                {showLabels && segment.percentage > 0.05 && (
                  <G>
                    {showPercentages && (
                      <SvgText
                        x={labelX}
                        y={labelY - 5}
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                        textAnchor="middle"
                      >
                        {Math.round(segment.percentage * 100)}%
                      </SvgText>
                    )}
                    <SvgText
                      x={labelX}
                      y={labelY + 10}
                      fontSize="10"
                      fill="white"
                      textAnchor="middle"
                    >
                      {segment.value}
                    </SvgText>
                  </G>
                )}
              </G>
            );
          })}
          
          {/* Center text for donut chart */}
          {innerRadius > 0 && (
            <G>
              <Circle
                cx={centerX}
                cy={centerY}
                r={innerRadius}
                fill={theme.colors.background.primary}
              />
              <SvgText
                x={centerX}
                y={centerY - 10}
                fontSize="24"
                fontWeight="bold"
                fill={theme.colors.text.primary}
                textAnchor="middle"
              >
                {total}
              </SvgText>
              <SvgText
                x={centerX}
                y={centerY + 10}
                fontSize="12"
                fill={theme.colors.text.secondary}
                textAnchor="middle"
              >
                Total
              </SvgText>
            </G>
          )}
        </Svg>
        
        {/* Legend */}
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
              <Text variant="caption" style={styles.legendLabel}>
                {segment.label} ({Math.round(segment.percentage * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  chartContainer: {
    alignItems: 'center',
  },
  svg: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
  },
});