import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../../atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './RecordingTimer.styles';

interface RecordingTimerProps {
  isRecording: boolean;
  duration: number;
}

export const RecordingTimer: React.FC<RecordingTimerProps> = ({
  isRecording,
  duration,
}) => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isRecording ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.timer}>
        <View style={[styles.dot, duration < 5 && styles.dotWarning]} />
        <Text variant="h2" style={{ 
          color: duration < 5 ? '#FF6B6B' : '#FFFFFF', 
          fontSize: 28, 
          fontWeight: 'bold' 
        }}>
          {formatTime(duration)}
        </Text>
      </View>
      <Text variant="caption" color="secondary" style={styles.label}>
        {duration < 5 
          ? 'Minimum 5 seconds required' 
          : String(t('record.button.recording', { duration }))}
      </Text>
    </Animated.View>
  );
};