import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Text } from '../../../components/atoms';
import { MorphingRecordButton } from '../../../components/atoms/MorphingRecordButton';
import { RecordingTimer } from '../../../components/molecules/RecordingTimer';
import { RecordingActions } from '../../../components/molecules/RecordingActions';
import { RecordingStatus } from '../../../components/molecules/RecordingStatus';
import { OfflineQueueStatus } from '../../../components/molecules/OfflineQueueStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useUploadNotifications } from '../../../hooks/useUploadNotifications';
import { useRecordingHandler } from '../../../hooks/useRecordingHandler';
import { useDreamStore } from '@somni/stores';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  const dreamStore = useDreamStore();
  const { user } = useAuth();
  
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    recordingDuration,
    isProcessing,
    error,
    clearError,
  } = useDreamRecorder();
  
  const { isOnline } = useNetworkStatus();
  
  const {
    pendingRecording,
    isTranscribing,
    savePendingRecording,
    acceptRecording,
    cancelRecording,
  } = useRecordingHandler();
  
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
  
  // Simulated amplitude for demo
  const [amplitude, setAmplitude] = useState(0);
  
  // Prevent double clicks
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Monitor real-time updates for transcription completion
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('dream-transcriptions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dreams',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Dream update received:', payload);
          
          if (payload.new.transcription_status === 'completed') {
            dreamStore.updateDream(payload.new.id, {
              rawTranscript: payload.new.raw_transcript,
              status: 'completed',
            });
            
            Alert.alert(
              'Transcription Complete!',
              'Your dream has been transcribed.',
              [{ text: 'OK' }]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, dreamStore]);

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
    if (isButtonDisabled || isProcessing) {
      return;
    }

    setIsButtonDisabled(true);
    
    try {
      if (isRecording) {
        const result = await stopRecording();
        savePendingRecording(result);
      } else {
        await startRecording();
      }
    } catch (err) {
      console.error('Record button error:', err);
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
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
              <RecordingActions
                onAccept={acceptRecording}
                onCancel={cancelRecording}
                isLoading={isTranscribing}
              />
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
          <RecordingStatus
            isRecording={isRecording}
            isProcessing={isProcessing}
            isTranscribing={isTranscribing}
            hasPendingRecording={!!pendingRecording}
            isOnline={isOnline}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};