import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../../atoms';
import { useStyles } from './RecordingTimer.styles';

interface RecordingTimerProps {
  isRecording: boolean;
  duration: number;
}

export const RecordingTimer: React.FC<RecordingTimerProps> = ({
  isRecording,
  duration,
}) => {
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
        <View style={styles.dot} />
        <Text variant="h2" style={styles.time}>
          {formatTime(duration)}
        </Text>
      </View>
      <Text variant="caption" style={styles.label}>
        Recording...
      </Text>
    </Animated.View>
  );
};