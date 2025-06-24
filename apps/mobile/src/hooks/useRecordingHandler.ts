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
  dreamId?: string;
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
    console.log('💾 Saving pending recording:', {
      result,
      hasSession: !!dreamStore.recordingSession,
      sessionId: dreamStore.recordingSession?.id,
      dreamId: dreamStore.recordingSession?.dreamId
    });
    
    if (result && dreamStore.recordingSession) {
      const recordingData = {
        sessionId: dreamStore.recordingSession.id,
        dreamId: dreamStore.recordingSession.dreamId, // Include dreamId
        audioUri: result.uri,
        duration: result.duration,
        fileSize: result.fileSize
      };
      
      setPendingRecording(recordingData);
      console.log('📼 Pending recording saved:', recordingData);
      return true;
    }
    console.warn('⚠️ Could not save pending recording - no result or session');
    return false;
  }, [dreamStore.recordingSession]);

  const acceptRecording = useCallback(async (): Promise<string | null> => {
    console.log('🎯 Accept recording clicked');
    
    const audioUri = pendingRecording?.audioUri || dreamStore.recordingSession?.audioUri;
    const dreamId = pendingRecording?.dreamId || dreamStore.recordingSession?.dreamId;
    
    console.log('📋 Recording details:', {
      audioUri,
      dreamId,
      sessionId: dreamStore.recordingSession?.id || pendingRecording?.sessionId,
      pendingRecording,
      recordingSession: dreamStore.recordingSession
    });
    
    if (!audioUri) {
      Alert.alert('Error', 'No audio file found');
      return null;
    }
    
    if (!dreamId) {
      console.error('❌ No dream ID found:', {
        pendingRecording,
        recordingSession: dreamStore.recordingSession
      });
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
      console.log('🔐 Auth check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: user?.id,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
      });
      
      // Prepare dream data matching the new schema
      const dreamData: any = {
        user_id: user.id,
        raw_transcript: '',
        title: null,
        is_lucid: false,
        mood: null,
        clarity: null,
        location_metadata: null,
        image_prompt: null,
        transcription_status: 'pending',
        transcription_metadata: null,
        transcription_job_id: null,
      };
      
      console.log('🔐 Creating dream with user_id:', user.id);
      console.log('📝 Dream data to insert:', dreamData);
      
      // Add location metadata if user has enabled location sharing
      if (profile?.settings?.location_sharing && profile.settings.location_sharing !== 'none') {
        dreamData.location_metadata = {
          method: profile.settings.location_sharing === 'exact' ? 'gps' : 'manual'
        };
        
        // Try to get current location if user has 'exact' sharing enabled
        if (profile.settings.location_sharing === 'exact') {
          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
              console.log('📍 Getting current location for dream...');
              const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              
              // Reverse geocode to get city/country
              const geocode = await Location.reverseGeocodeAsync({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude
              });
              
              if (geocode.length > 0) {
                const place = geocode[0];
                dreamData.location_metadata = {
                  city: place.city || place.subregion,
                  country: place.country,
                  countryCode: place.isoCountryCode,
                  method: 'gps'
                };
              }
              
              console.log('📍 Location metadata captured:', dreamData.location_metadata);
            }
          } catch (locationError) {
            console.warn('Failed to get location metadata:', locationError);
          }
        } else {
          // For manual location, use profile data
          if (profile.location_city || profile.location_country) {
            dreamData.location_metadata = {
              city: profile.location_city,
              country: profile.location_country,
              method: 'manual'
            };
          }
        }
      }
      
      const { data, error: createError } = await supabase
        .from('dreams')
        .insert(dreamData)
        .select()
        .single();
      
      createdDream = data;

      if (createError || !createdDream) {
        console.error('❌ Supabase dream creation failed:', {
          error: createError,
          errorMessage: createError?.message,
          errorDetails: createError?.details,
          errorHint: createError?.hint,
          errorCode: createError?.code,
          dreamData,
          data: createdDream
        });
        throw new Error(createError?.message || 'Failed to create dream record');
      }

      console.log('✅ Dream created in database:', {
        id: createdDream.id,
        user_id: createdDream.user_id,
        transcription_status: createdDream.transcription_status,
        created_at: createdDream.created_at
      });

      // Verify the dream exists before proceeding
      const { data: verifyDream, error: verifyError } = await supabase
        .from('dreams')
        .select('id, user_id')
        .eq('id', createdDream.id)
        .single();
        
      if (verifyError || !verifyDream) {
        console.error('❌ Dream verification failed:', {
          verifyError,
          dreamId: createdDream.id,
          userId: user.id
        });
        throw new Error('Dream was created but cannot be verified');
      }
      
      console.log('✅ Dream verified:', verifyDream);

      // Update local dream with the real ID
      dreamStore.updateDream(dreamId, {
        id: createdDream.id,
        transcription_status: 'processing'
      });
      
      // Read the audio file as base64
      console.log('💿 Reading audio file:', {
        uri: audioUri,
        fileExists: fileInfo.exists,
        fileSize: fileInfo.size,
        fileSizeMB: ((fileInfo.size || 0) / 1024 / 1024).toFixed(2)
      });
      
      const audioBase64 = await FileSystem.readAsStringAsync(
        audioUri,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      console.log('📦 Audio base64 encoded:', {
        base64Length: audioBase64.length,
        base64SizeMB: (audioBase64.length / 1024 / 1024).toFixed(2),
        base64Preview: audioBase64.substring(0, 50) + '...'
      });

      // Prepare request payload
      const requestPayload = {
        dreamId: createdDream.id,
        audioBase64,
        duration: pendingRecording?.duration || dreamStore.recordingSession.duration,
        // Use the language from user profile, convert to 3-letter code for ElevenLabs
        language: getElevenLabsLanguageCode(profile?.locale || 'en')
      };

      const transcriptionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`;
      
      console.log('📤 Sending transcription request:', {
        url: transcriptionUrl,
        dreamId: requestPayload.dreamId,
        audioSize: requestPayload.audioBase64.length,
        audioSizeMB: (requestPayload.audioBase64.length / 1024 / 1024).toFixed(2),
        duration: requestPayload.duration,
        language: requestPayload.language,
        hasAuth: !!session.access_token,
        authTokenPreview: session.access_token?.substring(0, 20) + '...',
        userId: user.id,
        sessionUserId: session.user?.id
      });

      // First, test if the edge function is reachable with a small request
      console.log('🔍 Testing edge function connectivity...');
      try {
        const testResponse = await fetch(transcriptionUrl, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('✅ Edge function is reachable:', testResponse.ok);
      } catch (testError) {
        console.error('❌ Edge function not reachable:', testError.message);
      }
      
      // Try-catch specifically for network errors
      let response;
      try {
        // For large payloads, we might need to use a different approach
        const payloadSizeMB = requestPayload.audioBase64.length / 1024 / 1024;
        
        if (payloadSizeMB > 2) {
          console.warn('⚠️ Large audio file detected:', payloadSizeMB.toFixed(2), 'MB');
          console.log('📦 Attempting to send large payload...');
        }
        
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Call edge function
        response = await fetch(
          transcriptionUrl,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        console.error('❌ Network fetch error:', {
          error: fetchError,
          message: fetchError.message,
          stack: fetchError.stack,
          url: transcriptionUrl,
          audioSizeMB: (requestPayload.audioBase64.length / 1024 / 1024).toFixed(2)
        });
        
        // If the request is too large, provide a specific error
        if (requestPayload.audioBase64.length > 5 * 1024 * 1024) { // 5MB
          throw new Error('Audio file too large. Please record a shorter dream (max 60 seconds).');
        }
        
        throw new Error(`Network error: ${fetchError.message}. Please check your internet connection.`);
      }

      if (!response) {
        throw new Error('No response received from server');
      }
      
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log('📥 Response data:', responseData);
      } catch (jsonError) {
        console.error('❌ Failed to parse response JSON:', jsonError);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Invalid response from server');
      }
      
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
      if (dreamId && audioUri) {
        dreamStore.updateDream(dreamId, {
          transcription_status: 'pending',
          raw_transcript: 'Waiting for transcription...',
          // Legacy fields for compatibility
          audioUri: audioUri,
          fileSize: pendingRecording?.fileSize,
          duration: pendingRecording?.duration || dreamStore.recordingSession?.duration
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
        transcription_status: 'pending',
        raw_transcript: 'Waiting for transcription...',
        // Legacy fields for compatibility
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