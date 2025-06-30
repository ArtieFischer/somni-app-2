import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type IconType = 'material' | 'ionicons';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  iconName?: string;
  iconType?: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  iconName,
  iconType,
  trend,
  variant = 'default',
}) => {
  const theme = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return theme.colors.status.success;
      default:
        return theme.colors.text.primary;
    }
  };

  const renderIcon = () => {
    const iconColor = getVariantColor();
    const iconSize = 24;

    if (iconName) {
      if (iconType === 'ionicons') {
        return <Ionicons name={iconName as any} size={iconSize} color={iconColor} />;
      } else {
        return <MaterialCommunityIcons name={iconName as any} size={iconSize} color={iconColor} />;
      }
    } else if (icon) {
      // Fallback to emoji if no iconName provided
      return (
        <Text style={[styles.icon, { color: iconColor }]}>
          {icon}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.elevated }]}>
      {(icon || iconName) && (
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[styles.value, { color: getVariantColor() }]}>
          {value}
        </Text>
        
        <Text variant="caption" color="secondary" style={styles.label}>
          {label}
        </Text>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Text 
              style={[
                styles.trendIcon, 
                { color: trend.isPositive ? theme.colors.status.success : theme.colors.status.error }
              ]}
            >
              {trend.isPositive ? '↑' : '↓'}
            </Text>
            <Text 
              variant="caption" 
              style={[
                styles.trendValue,
                { color: trend.isPositive ? theme.colors.status.success : theme.colors.status.error }
              ]}
            >
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  content: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});