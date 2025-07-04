import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Animated, SafeAreaView, Alert, StyleSheet, Pressable } from 'react-native';
import { Text } from '../../../components/atoms';
import SomniLogoMoon from '../../../../../../assets/logo_somni_moon.svg';
import { DreamyBackground } from '../../../components/DreamyRecordKit';
import Reanimated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';
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
import { useNavigation } from '@react-navigation/native';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { mapDatabaseDreamToFrontend } from '../../../utils/dreamMappers';
import * as FileSystem from 'expo-file-system';
// import { testRealtimeSubscription } from '../../../utils/realtimeDebug';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();
  const dreamStore = useDreamStore();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Track dreams recorded from this screen to avoid duplicate notifications
  const recordedDreamIdsRef = useRef<Set<string>>(new Set());
  
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
    saveLaterRecording,
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
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  // Simulated amplitude for demo
  const [amplitude, setAmplitude] = useState(0);
  
  // Prevent double clicks
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  
  // Reanimated values for warping effect
  const warpAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  // Animated style for the silver circle with scale animation only
  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleAnimation.value,
      [1, 1.1],
      [1, 1.1]
    );
    
    return {
      transform: [{ scale }],
    };
  });

  const handleRecordPress = useCallback(async () => {
    if (isButtonDisabled || isProcessing) {
      return;
    }

    setIsButtonDisabled(true);
    
    try {
      if (isRecording) {
        const result = await stopRecording();
        
        // Check minimum duration (5 seconds)
        if (result.duration < 5) {
          console.log('❌ Recording too short:', result.duration, 'seconds');
          
          // Show alert
          Alert.alert(
            'Recording Too Short',
            'Please record for at least 5 seconds to save your dream.',
            [{ text: 'OK' }]
          );
          
          // Delete the audio file
          try {
            await FileSystem.deleteAsync(result.uri);
            console.log('🗑️ Deleted short recording audio file');
          } catch (deleteError) {
            console.error('Failed to delete audio file:', deleteError);
          }
          
          // Clear the recording session without saving
          dreamStore.clearRecordingSession();
          
          // Don't save the pending recording
          return;
        }
        
        // Recording is long enough, save it
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
  }, [isButtonDisabled, isProcessing, isRecording, stopRecording, savePendingRecording, startRecording, dreamStore]);

  // Listen for tab press when already focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPressWhenFocused', (_e) => {
      // Only handle if not processing and no pending recording
      if (!isProcessing && !pendingRecording && !isButtonDisabled) {
        handleRecordPress();
      }
    });

    return unsubscribe;
  }, [isProcessing, pendingRecording, isButtonDisabled, handleRecordPress]);

  // Memoize the real-time event handler
  const handleRealtimeEvent = useCallback((payload: any) => {
      console.log('🔔 Dream table event:', {
        type: payload.eventType,
        table: payload.table,
        dreamId: payload.new?.id || payload.old?.id,
        transcriptionStatus: payload.new?.transcription_status,
        hasTranscript: !!payload.new?.raw_transcript,
        timestamp: new Date().toISOString()
      });
      
      // Handle UPDATE events
      if (payload.eventType === 'UPDATE' && payload.new) {
        const dream = payload.new;
        
        // Check if this is a transcription status update
        if (dream.transcription_status !== payload.old?.transcription_status) {
          console.log('📝 Transcription status changed:', {
            dreamId: dream.id,
            oldStatus: payload.old?.transcription_status,
            newStatus: dream.transcription_status,
            hasTranscript: !!dream.raw_transcript
          });
          
          if ((dream.transcription_status === 'completed' || dream.transcription_status === 'done') && dream.raw_transcript) {
            console.log('✅ Transcription completed for dream:', dream.id);
            
            // Check if this dream exists in the store
            const existingDream = dreamStore.getDreamById(dream.id);
            
            if (existingDream) {
              console.log('✅ Updating existing dream with completed transcription');
              // Update the existing dream with new status and transcript
              dreamStore.updateDream(dream.id, {
                raw_transcript: dream.raw_transcript,
                transcription_status: 'completed',
                status: 'completed', // Also update legacy status field
              });
            } else {
              // Only add dreams if they're from our recording session
              if (recordedDreamIdsRef.current.has(dream.id)) {
                console.log('⚠️ Dream not found in store, adding it (from our session)');
                // Map the full dream data using the mapper
                const mappedDream = mapDatabaseDreamToFrontend(dream);
                dreamStore.addDream(mappedDream as any);
              } else {
                console.log('🔇 Ignoring dream not from our session:', dream.id);
              }
            }
            
            // Remove from tracked dreams after completion
            if (recordedDreamIdsRef.current.has(dream.id)) {
              recordedDreamIdsRef.current.delete(dream.id);
            }
          } else if (dream.transcription_status === 'failed') {
            console.log('❌ Transcription failed for dream:', {
              id: dream.id,
              metadata: dream.transcription_metadata
            });
            
            // Map the database dream to frontend format
            const mappedDream = mapDatabaseDreamToFrontend(dream);
            dreamStore.updateDream(dream.id, mappedDream);
          } else if (dream.transcription_status === 'processing') {
            console.log('⏳ Transcription processing for dream:', dream.id);
            dreamStore.updateDream(dream.id, {
              transcription_status: 'processing',
            });
          }
        }
      }
      
      // Handle INSERT events (new dreams)
      if (payload.eventType === 'INSERT' && payload.new) {
        console.log('🆕 New dream inserted:', payload.new.id);
      }
  }, [dreamStore]);

  // Add a small delay before subscribing to avoid connection errors on app startup
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        setShouldSubscribe(true);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Monitor real-time updates for transcription completion
  useRealtimeSubscription({
    channelName: 'dream-transcriptions',
    table: 'dreams',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    enabled: shouldSubscribe && !!user?.id,
    onEvent: handleRealtimeEvent,
  });

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
      
      // Pulse animation for recording glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Start Reanimated warping effect
      warpAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
      
      scaleAnimation.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      setAmplitude(0);
      pulseAnim.setValue(0.3);
      
      // Reset Reanimated values
      warpAnimation.value = withTiming(0, { duration: 500 });
      scaleAnimation.value = withTiming(1, { duration: 500 });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, pulseAnim, warpAnimation, scaleAnimation]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert(String(t('errors.recordingError')), error, [
        { text: String(t('actions.ok')), onPress: clearError }
      ]);
    }
  }, [error, clearError, t]);

  return (
    <View style={styles.fullScreenContainer}>
      {/* Dreamy animated background - full screen absolute positioned */}
      <View style={StyleSheet.absoluteFill}>
        <DreamyBackground active={isRecording} />
      </View>
      
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
          {/* Title section - always render but with visibility control to maintain layout */}
          <View style={[styles.header, { opacity: !isRecording ? 1 : 0 }]}>
            <Text variant="h1" style={styles.title}>
              {pendingRecording ? String(t('record.dreamRecorded')) : String(t('record.title'))}
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {pendingRecording ? String(t('record.acceptToTranscribe')) : String(t('record.subtitle'))}
            </Text>
          </View>

          {/* Main recording button section - centered */}
          <View style={styles.centerButtonSection}>
            {!pendingRecording ? (
              <View style={styles.moonContainer}>
                {/* Single silver circle with opacity animation */}
                <Reanimated.View 
                  style={[
                    styles.silverCircle,
                    isRecording ? animatedCircleStyle : {}
                  ]}
                />
                
                <Pressable
                  onPress={handleRecordPress}
                  onPressIn={() => setButtonPressed(true)}
                  onPressOut={() => setButtonPressed(false)}
                  style={({ pressed }) => [
                    styles.moonButton,
                    pressed && styles.moonButtonPressed
                  ]}
                >
                  <SomniLogoMoon 
                    width={180} 
                    height={180} 
                    fill={isRecording ? "#10B981" : "#f0efe6"}
                    style={styles.moonIcon}
                  />
                </Pressable>
              </View>
            ) : (
              <View style={styles.actionsWrapper}>
                {/* Show title above actions when there's a pending recording */}
                <View style={styles.pendingHeader}>
                  <Text variant="h2" style={styles.pendingTitle}>
                    {String(t('record.dreamRecorded'))}
                  </Text>
                  <Text variant="body" color="secondary" style={styles.pendingSubtitle}>
                    {String(t('record.acceptToTranscribe'))}
                  </Text>
                </View>
                <RecordingActions
                  onAccept={async () => {
                    try {
                      const dreamId = await acceptRecording();
                      if (dreamId) {
                        // Track this dream ID to show notification when it completes
                        recordedDreamIdsRef.current.add(dreamId);
                      }
                    } catch (error) {
                      console.error('Failed to accept recording:', error);
                      
                      // Check if it's a "too short" error
                      if (error.message?.includes('Recording too short')) {
                        Alert.alert(
                          String(t('record.error.tooShort.title') || 'Recording Too Short'),
                          String(t('record.error.tooShort.message') || 'Please record for at least 5 seconds to capture your dream'),
                          [{ text: String(t('actions.ok')) }]
                        );
                      } else {
                        Alert.alert(
                          String(t('record.serviceUnavailable.title')),
                          String(t('record.serviceUnavailable.message')),
                          [{ text: String(t('actions.ok')) }]
                        );
                      }
                    }
                  }}
                  onSaveLater={saveLaterRecording}
                  onCancel={cancelRecording}
                  isLoading={isTranscribing}
                />
              </View>
            )}
          </View>

          {/* Recording timer - always render to prevent layout shift */}
          <View style={styles.timerSection}>
            <RecordingTimer
              isRecording={isRecording}
              duration={recordingDuration}
            />
          </View>

          {/* Instructions or status - at bottom */}
          <View style={styles.statusSection}>
            <RecordingStatus
              isRecording={isRecording}
              isProcessing={isProcessing}
              isTranscribing={isTranscribing}
              hasPendingRecording={!!pendingRecording}
              isOnline={isOnline}
            />
          </View>
        </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};