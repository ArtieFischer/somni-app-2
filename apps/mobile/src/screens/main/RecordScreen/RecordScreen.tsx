import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { MorphingRecordButton } from '../../../components/atoms/MorphingRecordButton';
import { RecordingTimer } from '../../../components/molecules/RecordingTimer';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const { isRecording, startRecording, stopRecording, duration } = useDreamRecorder();
  const { isOnline } = useNetworkStatus();
  const styles = useStyles();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Simulated amplitude for demo (replace with real audio amplitude)
  const [amplitude, setAmplitude] = useState(0);

  useEffect(() => {
    // Animate content on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Simulate amplitude changes when recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAmplitude(Math.random() * 0.8 + 0.2);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setAmplitude(0);
    }
  }, [isRecording]);

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Title section */}
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>
            {t('record.title')}
          </Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            {t('record.subtitle')}
          </Text>
        </View>

        {/* Main recording button with morphing animation */}
        <View style={styles.buttonSection}>
          <MorphingRecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
            amplitude={amplitude}
          />
        </View>

        {/* Recording timer */}
        <RecordingTimer
          isRecording={isRecording}
          duration={duration || 0}
        />

        {/* Instructions or status */}
        <View style={styles.instructionSection}>
          {!isRecording ? (
            <>
              <Text variant="body" color="secondary" style={styles.instruction}>
                {t('record.button.start')}
              </Text>
              {!isOnline && (
                <View style={styles.offlineNotice}>
                  <Text variant="caption" style={styles.offlineText}>
                    📡 {t('record.offline')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text variant="body" color="secondary" style={styles.instruction}>
              {t('record.whisperMode')}
            </Text>
          )}
        </View>

        {/* Bottom actions */}
        {isRecording && (
          <Animated.View
            style={[
              styles.actions,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Button
              variant="secondary"
              size="medium"
              onPress={() => console.log('Pause')}
            >
              Pause
            </Button>
          </Animated.View>
        )}
      </Animated.View>
    </ScrollView>
  );
};