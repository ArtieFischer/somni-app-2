import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Animated, SafeAreaView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../infrastructure/supabase/client'; // Use consistent import
import { Text } from '../../../components/atoms';
import { Button } from '../../../components/atoms/Button';
import { MorphingRecordButton } from '../../../components/atoms/MorphingRecordButton';
import { RecordingTimer } from '../../../components/molecules/RecordingTimer';
import { OfflineQueueStatus } from '../../../components/molecules/OfflineQueueStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useUploadNotifications } from '../../../hooks/useUploadNotifications';
import { useOfflineRecordingQueue } from '../../../hooks/useOfflineRecordingQueue';
import { useDreamStore } from '@somni/stores';
import { useAuth } from '../../../hooks/useAuth'; // Use your auth hook
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  const dreamStore = useDreamStore();
  const { session, user } = useAuth(); // Get auth info
  const offlineQueue = useOfflineRecordingQueue();
  
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
  
  // State for pending recording
  const [pendingRecording, setPendingRecording] = useState<{
    sessionId: string;
    audioUri: string;
    duration: number;
    fileSize: number;
  } | null>(null);
  
  // State for transcription processing
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
        const result = await stopRecording();
        
        // Save the recording info for acceptance
        if (result && dreamStore.recordingSession) {
          setPendingRecording({
            sessionId: dreamStore.recordingSession.id,
            audioUri: result.audioUri,
            duration: result.duration,
            fileSize: result.fileSize
          });
          console.log('📼 Pending recording saved:', result);
        }
      } else {
        setPendingRecording(null); // Clear any pending recording
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

  const handleAcceptRecording = async () => {
    if (!pendingRecording || !dreamStore.recordingSession?.dreamId) {
      console.error('No pending recording to accept');
      return;
    }

    // Check if we have a valid session
    if (!session?.access_token) {
      Alert.alert(
        'Authentication Required',
        'Please log in to transcribe your dreams',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsTranscribing(true);
      
      // Make sure we have the audio URI
      const audioUri = pendingRecording.audioUri;
      if (!audioUri) {
        throw new Error('No audio file found');
      }
      
      // Read the audio file as base64
      console.log('📖 Reading audio file from:', audioUri);
      const audioBase64 = await FileSystem.readAsStringAsync(
        audioUri,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      console.log('📤 Sending to transcription service...');
      console.log('Dream ID:', dreamStore.recordingSession.dreamId);
      console.log('Audio size:', audioBase64.length);
      console.log('Duration:', pendingRecording.duration);
      console.log('User ID:', user?.id);

      // Call your edge function
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dreamId: dreamStore.recordingSession.dreamId,
            audioBase64,
            duration: pendingRecording.duration
          })
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Transcription failed');
      }

      console.log('✅ Transcription initiated:', responseData);

      // Update dream status
      dreamStore.updateDream(dreamStore.recordingSession.dreamId, {
        status: 'transcribing'
      });

      // Delete the local audio file since we've sent it
      if (audioUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(audioUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(audioUri);
            console.log('🗑️ Deleted local audio file');
          }
        } catch (deleteError) {
          console.warn('Failed to delete audio file:', deleteError);
        }
      }

      // Clear pending recording
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
      
      Alert.alert(
        String(t('notifications.dreamCaptured.title')),
        'Your dream is being transcribed!',
        [{ text: String(t('actions.ok')) }]
      );

    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to start transcription',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCancelRecording = async () => {
    if (pendingRecording && pendingRecording.audioUri) {
      // Delete the audio file
      try {
        const fileInfo = await FileSystem.getInfoAsync(pendingRecording.audioUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(pendingRecording.audioUri);
          console.log('🗑️ Deleted audio file');
        }
      } catch (error) {
        console.error('Failed to delete audio file:', error);
      }
      
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
    }
  };

  // Regular function to get status text
  const getStatusText = () => {
    if (isProcessing) {
      return String(t('record.processing'));
    }
    if (isRecording) {
      return String(t('record.whisperMode'));
    }
    if (pendingRecording) {
      return String(t('record.acceptOrCancel'));
    }
    return String(t('record.button.start'));
  };

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

          {/* Main recording button or accept/cancel buttons */}
          <View style={styles.buttonSection}>
            {!pendingRecording ? (
              <MorphingRecordButton
                isRecording={isRecording}
                onPress={handleRecordPress}
                amplitude={amplitude}
              />
            ) : (
              <View style={styles.actionButtons}>
                <Button
                  variant="primary"
                  size="large"
                  onPress={handleAcceptRecording}
                  loading={isTranscribing}
                  disabled={isTranscribing}
                  style={styles.acceptButton}
                >
                  {String(t('record.acceptRecording'))}
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  onPress={handleCancelRecording}
                  disabled={isTranscribing}
                  style={styles.cancelButton}
                >
                  {String(t('record.cancelRecording'))}
                </Button>
              </View>
            )}
          </View>

          {/* Recording timer */}
          {isRecording && (
            <RecordingTimer
              isRecording={isRecording}
              duration={recordingDuration}
            />
          )}

          {/* Instructions or status */}
          <View style={styles.instructionSection}>
            <Text variant="body" color="secondary" style={styles.instruction}>
              {getStatusText()}
            </Text>
            
            {!isOnline && (
              <View style={styles.offlineNotice}>
                <Text variant="caption" style={styles.offlineText}>
                  📡 {String(t('record.offline'))}
                </Text>
              </View>
            )}

            {(isProcessing || isTranscribing) && (
              <Text variant="caption" color="secondary" style={styles.processingText}>
                {isTranscribing ? String(t('record.transcribing')) : String(t('record.processing'))}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};