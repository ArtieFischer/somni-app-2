import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

interface InsightCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  subtitle,
  children,
  action,
}) => {
  const theme = useTheme();

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="h5" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="secondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {action && (
          <Text
            variant="caption"
            style={[styles.action, { color: theme.colors.primary }]}
            onPress={action.onPress}
          >
            {action.label}
          </Text>
        )}
      </View>
      
      <View style={styles.content}>
        {children}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});