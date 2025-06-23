import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useDreamStore } from '@somni/stores';
import { useAuth } from './useAuth';
import { useTranslation } from './useTranslation';
import { getElevenLabsLanguageCode } from '../utils/languageMapping';

interface PendingRecording {
  sessionId: string;
  audioUri: string;
  duration: number;
  fileSize: number;
}

export const useRecordingHandler = () => {
  const { t } = useTranslation('dreams');
  const dreamStore = useDreamStore();
  const { session, user, profile } = useAuth();
  const [pendingRecording, setPendingRecording] = useState<PendingRecording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const savePendingRecording = useCallback((result: any) => {
    if (result && dreamStore.recordingSession) {
      const recordingData = {
        sessionId: dreamStore.recordingSession.id,
        audioUri: result.uri,
        duration: result.duration,
        fileSize: result.fileSize
      };
      
      setPendingRecording(recordingData);
      console.log('📼 Pending recording saved:', recordingData);
      return true;
    }
    return false;
  }, [dreamStore.recordingSession]);

  const acceptRecording = useCallback(async (): Promise<string | null> => {
    console.log('🎯 Accept recording clicked');
    
    const audioUri = pendingRecording?.audioUri || dreamStore.recordingSession?.audioUri;
    
    if (!audioUri) {
      Alert.alert('Error', 'No audio file found');
      return null;
    }
    
    if (!dreamStore.recordingSession?.dreamId) {
      Alert.alert('Error', 'No dream session found');
      return null;
    }

    if (!session?.access_token || !user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please log in to transcribe your dreams',
        [{ text: 'OK' }]
      );
      return null;
    }
    
    let createdDream: any = null;

    try {
      setIsTranscribing(true);
      
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // Create dream in Supabase
      console.log('📝 Creating dream in database...');
      
      // Prepare dream data with location if user has enabled location sharing
      const dreamData: any = {
        user_id: user.id,
        raw_transcript: '',
        duration: pendingRecording?.duration || dreamStore.recordingSession.duration,
        transcription_status: 'pending',
        created_at: new Date().toISOString(),
      };
      
      // Add location data based on user's location sharing preferences
      if (profile?.settings?.location_sharing && profile.settings.location_sharing !== 'none') {
        dreamData.location_accuracy = profile.settings.location_sharing;
        
        // Try to get current location if user has 'exact' sharing enabled
        if (profile.settings.location_sharing === 'exact') {
          try {
            // Check if we already have location permission
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
              console.log('📍 Getting current location for dream...');
              const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              
              dreamData.location = {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude
              };
              
              console.log('📍 Current location captured:', dreamData.location);
            } else {
              // Fall back to stored location from profile
              if (profile.location) {
                dreamData.location = profile.location;
                console.log('📍 Using stored location from profile');
              }
            }
          } catch (locationError) {
            console.warn('Failed to get current location, using profile location:', locationError);
            // Fall back to stored location from profile
            if (profile.location) {
              dreamData.location = profile.location;
            }
          }
        } else {
          // For country/city level, use stored location from profile
          if (profile.location) {
            dreamData.location = profile.location;
          }
        }
        
        console.log('📍 Adding location data to dream:', {
          accuracy: dreamData.location_accuracy,
          hasCoordinates: !!dreamData.location,
          isRealTime: dreamData.location_accuracy === 'exact'
        });
      } else {
        // Explicitly set to 'none' if user hasn't enabled location sharing
        dreamData.location_accuracy = 'none';
      }
      
      const { data, error: createError } = await supabase
        .from('dreams')
        .insert(dreamData)
        .select()
        .single();
      
      createdDream = data;

      if (createError || !createdDream) {
        throw new Error('Failed to create dream record');
      }

      console.log('✅ Dream created in database:', createdDream.id);

      // Update local dream with the real ID
      dreamStore.updateDream(dreamStore.recordingSession.dreamId, {
        id: createdDream.id,
        status: 'transcribing'
      });
      
      // Read the audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(
        audioUri,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Prepare request payload
      const requestPayload = {
        dreamId: createdDream.id,
        audioBase64,
        duration: pendingRecording?.duration || dreamStore.recordingSession.duration,
        // Use the language from user profile, convert to 3-letter code for ElevenLabs
        language: getElevenLabsLanguageCode(profile?.locale || 'en')
      };

      console.log('📤 Sending transcription request:', {
        url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
        dreamId: requestPayload.dreamId,
        audioSize: requestPayload.audioBase64.length,
        duration: requestPayload.duration,
        language: requestPayload.language,
        hasAuth: !!session.access_token
      });

      // Call edge function
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        }
      );

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseData = await response.json();
      console.log('📥 Response data:', responseData);
      
      if (!response.ok) {
        console.error('❌ Transcription request failed:', {
          status: response.status,
          error: responseData.error,
          fullResponse: responseData
        });
        throw new Error(responseData.error || 'Transcription failed');
      }

      console.log('✅ Transcription initiated successfully:', {
        dreamId: responseData.dreamId,
        success: responseData.success,
        transcriptionLength: responseData.transcription?.text?.length
      });

      // Delete the local audio file
      try {
        await FileSystem.deleteAsync(audioUri);
        console.log('🗑️ Deleted local audio file');
      } catch (deleteError) {
        console.warn('Failed to delete audio file:', deleteError);
      }

      
      // Clear the pending recording and session without navigation
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
      
      // Return the created dream ID for tracking
      return createdDream.id;

    } catch (error) {
      console.error('❌ Transcription error:', {
        error: error.message || error,
        type: error.constructor.name,
        stack: error.stack,
        dreamId: createdDream?.id,
        url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`
      });
      
      // Save dream as pending in local store with audio URI
      if (dreamStore.recordingSession?.dreamId && audioUri) {
        dreamStore.updateDream(dreamStore.recordingSession.dreamId, {
          status: 'pending',
          rawTranscript: 'Waiting for transcription...',
          audioUri: audioUri,
          fileSize: pendingRecording?.fileSize,
          duration: pendingRecording?.duration || dreamStore.recordingSession.duration
        });
      }
      
      // Clear pending recording
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
    } finally {
      setIsTranscribing(false);
      console.log('🏁 Transcription process finished');
    }
    
    return null;
  }, [pendingRecording, dreamStore, session, user, t]);

  const saveLaterRecording = useCallback(async () => {
    if (!pendingRecording || !dreamStore.recordingSession?.dreamId) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    try {
      // Update dream in local store with pending status and audio URI
      dreamStore.updateDream(dreamStore.recordingSession.dreamId, {
        status: 'pending',
        rawTranscript: 'Waiting for transcription...',
        audioUri: pendingRecording.audioUri,
        fileSize: pendingRecording.fileSize,
        duration: pendingRecording.duration
      });

      // Clear pending recording and session
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
      
      Alert.alert(
        'Recording Saved',
        'Your dream has been saved and will be transcribed later. You can find it in your Dream Diary.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Save later error:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  }, [pendingRecording, dreamStore]);

  const cancelRecording = useCallback(async () => {
    if (pendingRecording?.audioUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(pendingRecording.audioUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(pendingRecording.audioUri);
          console.log('🗑️ Deleted audio file');
        }
      } catch (error) {
        console.error('Failed to delete audio file:', error);
      }
      
      // Also delete the dream from the store if it exists
      if (dreamStore.recordingSession?.dreamId) {
        dreamStore.deleteDream(dreamStore.recordingSession.dreamId);
      }
      
      setPendingRecording(null);
      dreamStore.clearRecordingSession();
    }
  }, [pendingRecording, dreamStore]);

  return {
    pendingRecording,
    setPendingRecording,
    isTranscribing,
    savePendingRecording,
    acceptRecording,
    saveLaterRecording,
    cancelRecording,
  };
};