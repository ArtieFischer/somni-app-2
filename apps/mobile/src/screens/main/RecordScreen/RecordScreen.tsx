import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Animated, SafeAreaView, Alert } from 'react-native';
import { Text } from '../../../components/atoms';
import { MorphingRecordButton } from '../../../components/atoms/MorphingRecordButton';
import { RecordingTimer } from '../../../components/molecules/RecordingTimer';
import { OfflineQueueStatus } from '../../../components/molecules/OfflineQueueStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useUploadNotifications } from '../../../hooks/useUploadNotifications';
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    recordingDuration,
    isProcessing,
    error,
    clearError,
    offlineQueueStatus
  } = useDreamRecorder();
  
  const { isOnline } = useNetworkStatus();
  
  // Use upload notifications hook
  useUploadNotifications({
    onUploadComplete: (recordingId) => {
      console.log('Upload completed for:', recordingId);
    },
    onUploadFailed: (recordingId, error) => {
      console.log('Upload failed for:', recordingId, error);
    }
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Simulated amplitude for demo (replace with real audio amplitude)
  const [amplitude, setAmplitude] = useState(0);
  
  // Prevent double clicks
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
  }, [fadeAnim, slideAnim]);

  // Simulate amplitude changes when recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setAmplitude(Math.random() * 0.8 + 0.2);
      }, 200);
    } else {
      setAmplitude(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Recording Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const handleRecordPress = async () => {
    // Prevent double clicks
    if (isButtonDisabled || isProcessing) {
      return;
    }

    setIsButtonDisabled(true);
    
    try {
      if (isRecording) {
        await stopRecording();
        
        // Show success feedback
        Alert.alert(
          '✨ Dream Captured',
          isOnline 
            ? 'Your dream is being processed and will be ready shortly.'
            : 'Your dream has been saved and will upload when you\'re back online.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        await startRecording();
      }
    } catch (err) {
      console.error('Record button error:', err);
    } finally {
      // Re-enable button after a short delay
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 500);
    }
  };

  const getStatusText = useMemo(() => {
    if (isProcessing) {
      return t('record.processing');
    }
    if (isRecording) {
      return t('record.whisperMode');
    }
    return t('record.button.start');
  }, [isProcessing, isRecording, t]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Offline queue status at the top */}
        <OfflineQueueStatus />

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
            duration={recordingDuration}
          />

          {/* Instructions or status */}
          <View style={styles.instructionSection}>
            <Text variant="body" color="secondary" style={styles.instruction}>
              {getStatusText}
            </Text>
            
            {!isOnline && (
              <View style={styles.offlineNotice}>
                <Text variant="caption" style={styles.offlineText}>
                  📡 {t('record.offline')}
                </Text>
              </View>
            )}

            {isProcessing && (
              <Text variant="caption" color="secondary" style={styles.processingText}>
                {t('record.processing')}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};