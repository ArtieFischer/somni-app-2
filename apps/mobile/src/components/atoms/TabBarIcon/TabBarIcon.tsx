import React from 'react';
import { View, Text } from 'react-native';
import { TabIconName } from '@somni/types';
import { useStyles } from './TabBarIcon.styles';
import { useDreamStore } from '@somni/stores';

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
  // Only check recording state for the record tab icon
  const isRecording = useDreamStore(state => 
    name === 'record' ? state.isRecording : false
  );
  
  const styles = useStyles(focused);

  // Using emojis temporarily - will replace with proper icons
  const getIcon = () => {
    switch (name) {
      case 'feed':
        return '🌊';
      case 'diary':
        return '📖';
      case 'record':
        // Show different icon based on recording state
        return isRecording ? '🔴' : (focused ? '⭕' : '⭕');
      case 'analysis':
        return '📊';
      case 'profile':
        return '👤';
      default:
        return '?';
    }
  };

  const isRecordTab = name === 'record';
  const showRecordingState = isRecordTab && isRecording;

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconWrapper, 
        isRecordTab && styles.recordIconWrapper,
        showRecordingState && styles.recordingIconWrapper
      ]}>
        <View style={styles.icon}>
          <View style={{ opacity: focused || showRecordingState ? 1 : 0.6 }}>
            <Text style={[
              styles.iconText, 
              { 
                color: showRecordingState ? '#FF0000' : color, 
                fontSize: isRecordTab ? 30 : 24 
              }
            ]}>
              {getIcon()}
            </Text>
          </View>
        </View>
        {showRecordingState && (
          <View style={styles.recordingGlow} />
        )}
      </View>
    </View>
  );
};