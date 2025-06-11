import React from 'react';
import { View, Text } from 'react-native';
import { TabIconName } from '@somni/types';
import { useStyles } from './TabBarIcon.styles';

export interface TabBarIconProps {
  name: TabIconName;
  focused: boolean;
  color?: string;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  color,
}) => {
  const styles = useStyles(focused);

  // Using emojis temporarily - will replace with proper icons
  const getIcon = () => {
    switch (name) {
      case 'feed':
        return '🌊';
      case 'diary':
        return '📖';
      case 'record':
        return focused ? '🔴' : '⭕';
      case 'analysis':
        return '📊';
      case 'profile':
        return '👤';
      default:
        return '?';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, name === 'record' && styles.recordIconWrapper]}>
        <View style={styles.icon}>
          <View style={{ opacity: focused ? 1 : 0.6 }}>
            <Text style={[styles.iconText, { color, fontSize: name === 'record' ? 30 : 24 }]}>
              {getIcon()}
            </Text>
          </View>
        </View>
        {name === 'record' && focused && (
          <View style={styles.recordingGlow} />
        )}
      </View>
    </View>
  );
};