import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Animated, SafeAreaView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Text, Button } from '../../../components/atoms';
import { MorphingRecordButton } from '../../../components/atoms/MorphingRecordButton';
import { RecordingTimer } from '../../../components/molecules/RecordingTimer';
import { OfflineQueueStatus } from '../../../components/molecules/OfflineQueueStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useUploadNotifications } from '../../../hooks/useUploadNotifications';
import { useAuthStore } from '@somni/stores';
import { supabase } from '../../../lib/supabase';
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  const { session } = useAuthStore();
  
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    recordingDuration,
    isProcessing,
    error,
    clearError,
    offlineQueueStatus,
    session: recordingSession
  } = useDreamRecorder();
  
  const { isOnline } = useNetworkStatus();
  
  // NEW: State for accept button
  const [showAcceptButton, setShowAcceptButton] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
      Alert.alert(String(t('errors.recordingError')), error, [
        { text: String(t('actions.ok')), onPress: clearError }
      ]);
    }
  }, [error, clearError, t]);

  const handleRecordPress = async () => {
    // Prevent double clicks
    if (isButtonDisabled || isProcessing) {
      return;
    }

    setIsButtonDisabled(true);
    
    try {
      if (isRecording) {
        await stopRecording();
        setShowAcceptButton(true); // NEW: Show accept button after recording
      } else {
        setShowAcceptButton(false);
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

  // NEW: Accept recording handler
  const handleAcceptRecording = async () => {
    if (!recordingSession?.dreamId || !recordingSession.audioUri) {
      Alert.alert('Error', 'No recording session found');
      return;
    }

    if (!session?.access_token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      setIsTranscribing(true);

      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(
        recordingSession.audioUri, 
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Call edge function
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dreamId: recordingSession.dreamId,
            audioBase64,
            duration: recordingDuration
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const result = await response.json();
      console.log('Transcription started:', result);

      // Hide accept button and show success
      setShowAcceptButton(false);
      
      Alert.alert(
        String(t('notifications.dreamCaptured.title')),
        'Your dream is being transcribed! Check back in a few moments.',
        [{ text: String(t('actions.ok')) }]
      );

    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Transcription Error', 
        error instanceof Error ? error.message : 'Failed to start transcription'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  // NEW: Discard recording handler
  const handleDiscardRecording = () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => {
            setShowAcceptButton(false);
            // Clear the recording session if needed
            // dreamStore.clearRecordingSession();
          }
        }
      ]
    );
  };

  const getStatusText = useMemo(() => {
    if (isTranscribing) {
      return 'Starting transcription...';
    }
    if (isProcessing) {
      return String(t('record.processing'));
    }
    if (isRecording) {
      return String(t('record.whisperMode'));
    }
    if (showAcceptButton) {
      return 'Recording complete! Accept or discard?';
    }
    return String(t('record.button.start'));
  }, [isProcessing, isRecording, showAcceptButton, isTranscribing, t]);

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
              {String(t('record.title'))}
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {String(t('record.subtitle'))}
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

          {/* NEW: Accept/Discard buttons */}
          {showAcceptButton && (
            <View style={styles.acceptButtonsContainer}>
              <Button
                variant="primary"
                size="large"
                onPress={handleAcceptRecording}
                loading={isTranscribing}
                style={styles.acceptButton}
              >
                {isTranscribing ? 'Starting Transcription...' : 'Accept Recording'}
              </Button>
              
              <Button
                variant="ghost"
                size="medium"
                onPress={handleDiscardRecording}
                disabled={isTranscribing}
                style={styles.discardButton}
              >
                Discard
              </Button>
            </View>
          )}

          {/* Instructions or status */}
          <View style={styles.instructionSection}>
            <Text variant="body" color="secondary" style={styles.instruction}>
              {getStatusText}
            </Text>
            
            {!isOnline && (
              <View style={styles.offlineNotice}>
                <Text variant="caption" style={styles.offlineText}>
                  📡 {String(t('record.offline'))}
                </Text>
              </View>
            )}

            {isProcessing && (
              <Text variant="caption" color="secondary" style={styles.processingText}>
                {String(t('record.processing'))}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};