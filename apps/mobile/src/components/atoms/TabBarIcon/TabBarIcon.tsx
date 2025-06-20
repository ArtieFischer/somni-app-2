import React from 'react';
import { View } from 'react-native';
import { TabIconName } from '@somni/types';
import { useStyles } from './TabBarIcon.styles';
import { useDreamStore } from '@somni/stores';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const isRecordTab = name === 'record';
  const showRecordingState = isRecordTab && isRecording;

  const getIcon = () => {
    const iconSize = isRecordTab ? 24 : 22;
    // Keep record button icon white at all times, use provided color for other icons
    const iconColor = isRecordTab ? (color || '#FFFFFF') : (color || styles.iconText.color);

    switch (name) {
      case 'feed':
        return <MaterialCommunityIcons name="home-variant" size={iconSize} color={iconColor} />;
      case 'diary':
        return <MaterialCommunityIcons name="book-open-variant" size={iconSize} color={iconColor} />;
      case 'record':
        // Force white color for record icon
        return <MaterialCommunityIcons name="microphone" size={iconSize} color="#FFFFFF" />;
      case 'analysis':
        return <Ionicons name="analytics" size={iconSize} color={iconColor} />;
      case 'profile':
        return <Ionicons name="person" size={iconSize} color={iconColor} />;
      default:
        return <MaterialCommunityIcons name="help-circle" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        {showRecordingState && (
          <View style={styles.recordingGlow} />
        )}
        <View style={[styles.icon, { zIndex: 1, position: 'relative' }]}>
          <View style={{ opacity: focused || showRecordingState || isRecordTab ? 1 : 0.6 }}>
            {getIcon()}
          </View>
        </View>
      </View>
    </View>
  );
};