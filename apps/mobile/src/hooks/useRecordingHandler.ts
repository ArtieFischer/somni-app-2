import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useDreamStore } from '@somni/stores';
import { useAuth } from './useAuth';
import { useTranslation } from './useTranslation';
import { getElevenLabsLanguageCode } from '../utils/languageMapping';
import { mapDatabaseDreamToFrontend } from '../utils/dreamMappers';

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
      // Safety check: don't save recordings shorter than 5 seconds
      if (result.duration < 5) {
        console.error('❌ Recording too short to save:', result.duration, 'seconds');
        return false;
      }
      
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
    
    // Check if we have a dream ID - if not, or if it's temporary, we need to create a new dream
    const isTemporaryId = dreamId?.startsWith('temp_');
    
    if (!dreamId || isTemporaryId) {
      console.log('📝 No real dream ID found, will create new dream in database');
    }

    if (!session?.access_token || !user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please log in to transcribe your dreams',
        [{ text: 'OK' }]
      );
      return null;
    }
    
    // Get the duration (already validated in savePendingRecording)
    const duration = pendingRecording?.duration || dreamStore.recordingSession?.duration || 0;
    
    let createdDream: any = null;

    try {
      setIsTranscribing(true);
      
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // If we have a temporary dream, delete it first
      if (isTemporaryId && dreamId) {
        console.log('🗑️ Deleting temporary dream:', dreamId);
        dreamStore.deleteDream(dreamId);
      }

      // Ensure user has a profile before creating dreams (temporary fix)
      console.log('🔍 Checking if user has profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profile doesn't exist - create one
        console.log('📝 Creating missing profile for user:', user.id);
        
        // Generate a unique handle
        let handle = `user_${user.id.substring(0, 8)}`;
        let attempt = 0;
        let profileCreated = false;
        
        while (!profileCreated && attempt < 3) {
          if (attempt > 0) {
            // Add random suffix for uniqueness
            handle = `user_${user.id.substring(0, 8)}_${Math.random().toString(36).substring(2, 6)}`;
          }
          
          const { error: profileCreateError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              handle,
              username: user.email?.split('@')[0] || 'user',
              sex: 'unspecified',
              locale: 'en',
              is_premium: false,
              onboarding_complete: false,
              location_accuracy: 'none',
              settings: {
                location_sharing: 'none',
                sleep_schedule: null,
                improve_sleep_quality: null,
                interested_in_lucid_dreaming: null
              }
            });

          if (profileCreateError) {
            if (profileCreateError.code === '23505') {
              // Unique constraint violation - try again with different handle
              console.log('⚠️ Handle already exists, trying with different handle...');
              attempt++;
            } else {
              console.error('❌ Failed to create profile:', profileCreateError);
              throw new Error(`Failed to create user profile: ${profileCreateError.message}`);
            }
          } else {
            profileCreated = true;
            console.log('✅ Profile created successfully');
          }
        }
        
        if (!profileCreated) {
          throw new Error('Failed to create user profile after multiple attempts');
        }
      } else if (profileCheckError) {
        console.error('❌ Error checking profile:', profileCheckError);
        throw new Error('Failed to verify user profile');
      } else {
        console.log('✅ User profile exists');
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
        .select('*')
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
        created_at: createdDream.created_at,
        allFields: Object.keys(createdDream),
        fullDream: createdDream
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

      // Update the existing temporary dream in the local store
      if (!createdDream.user_id) {
        console.error('❌ Created dream missing user_id:', createdDream);
        // If user_id is missing, add it from the authenticated user
        createdDream.user_id = user.id;
      }
      
      const mappedDream = mapDatabaseDreamToFrontend(createdDream);
      console.log('🔄 Updating temporary dream in store:', {
        tempId: dreamId,
        newId: mappedDream.id,
        user_id: mappedDream.user_id,
        userId: mappedDream.userId,
        hasAllRequiredFields: !!mappedDream.user_id && !!mappedDream.id
      });
      
      try {
        // Check if the temporary dream exists
        const tempDream = dreamStore.getDreamById(dreamId);
        if (tempDream) {
          // Delete the temporary dream first to avoid duplicates
          dreamStore.deleteDream(dreamId);
          console.log('🗑️ Removed temporary dream:', dreamId);
          
          // Add the real dream with the database ID
          dreamStore.addDream({
            ...mappedDream,
            audioUri: audioUri, // Keep the audio URI for potential retry
            duration: pendingRecording?.duration || dreamStore.recordingSession?.duration || 0
          } as any);
          console.log('✅ Added real dream:', createdDream.id);
        } else {
          // If for some reason the temp dream doesn't exist, check if real dream already exists
          const existingRealDream = dreamStore.getDreamById(createdDream.id);
          if (!existingRealDream) {
            console.warn('⚠️ Temporary dream not found, adding new dream');
            dreamStore.addDream({
              ...mappedDream,
              audioUri: audioUri,
              duration: pendingRecording?.duration || dreamStore.recordingSession?.duration || 0
            } as any);
          } else {
            console.log('ℹ️ Real dream already exists, updating it');
            dreamStore.updateDream(createdDream.id, {
              ...mappedDream,
              audioUri: audioUri,
              duration: pendingRecording?.duration || dreamStore.recordingSession?.duration || 0
            });
          }
        }
      } catch (addError) {
        console.error('❌ Failed to update dream in store:', addError);
        // Continue with transcription even if local store update fails
      }
      
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
        duration: duration, // Use the validated duration from above
        // Use the language from user profile, convert to 3-letter code for ElevenLabs
        language: getElevenLabsLanguageCode(profile?.locale || 'en'),
        // Include location metadata if available
        ...(createdDream.location_metadata && { locationMetadata: createdDream.location_metadata })
      };

      const transcriptionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`;
      
      console.log('📤 Sending transcription request:', {
        url: transcriptionUrl,
        dreamId: requestPayload.dreamId,
        audioSize: requestPayload.audioBase64.length,
        audioSizeMB: (requestPayload.audioBase64.length / 1024 / 1024).toFixed(2),
        duration: requestPayload.duration,
        language: requestPayload.language,
        hasLocationMetadata: !!requestPayload.locationMetadata,
        locationMetadata: requestPayload.locationMetadata,
        hasAuth: !!session.access_token,
        authTokenPreview: session.access_token?.substring(0, 20) + '...',
        apiSecretPreview: (process.env.EXPO_PUBLIC_SOMNI_BACKEND_API_SECRET || '').substring(0, 10) + '...',
        hasApiSecret: !!(process.env.EXPO_PUBLIC_SOMNI_BACKEND_API_SECRET),
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
              'authorization': `Bearer ${session.access_token}`,
              'content-type': 'application/json',
              'x-api-secret': process.env.EXPO_PUBLIC_SOMNI_BACKEND_API_SECRET || '',
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
          message: responseData.message,
          fullResponse: responseData
        });
        
        // Check if it's a "too short" error
        if (responseData.error === 'Recording too short' && createdDream?.id) {
          // The edge function should have already updated the dream status
          console.log('⏱️ Recording was too short, fetching updated dream from database');
          
          // Fetch the updated dream with error metadata
          const { data: updatedDream, error: fetchError } = await supabase
            .from('dreams')
            .select('*')
            .eq('id', createdDream.id)
            .single();
            
          if (!fetchError && updatedDream) {
            console.log('✅ Got updated dream with error metadata:', {
              id: updatedDream.id,
              status: updatedDream.transcription_status,
              metadata: updatedDream.transcription_metadata
            });
            
            // Update the local dream store
            const mappedDream = mapDatabaseDreamToFrontend(updatedDream);
            
            // Check if dream exists in store
            const existingDream = dreamStore.getDreamById(createdDream.id);
            if (existingDream) {
              dreamStore.updateDream(createdDream.id, mappedDream);
            } else {
              // If dream wasn't added due to validation error, add it now
              console.log('🆕 Adding dream with error metadata to store');
              dreamStore.addDream(mappedDream as any);
            }
          }
        }
        
        throw new Error(responseData.message || responseData.error || 'Transcription failed');
      }

      console.log('✅ Transcription initiated successfully:', {
        dreamId: responseData.dreamId,
        success: responseData.success,
        transcriptionLength: responseData.transcription?.text?.length
      });
      
      // Update dream status to processing
      dreamStore.updateDream(createdDream.id, {
        status: 'transcribing',
        transcription_status: 'processing'
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
      
      // Only save dream as pending if it's not a "too short" error
      // (for "too short" errors, we already updated the dream with the error metadata)
      if (createdDream?.id && audioUri && !error.message?.includes('Recording too short')) {
        dreamStore.updateDream(createdDream.id, {
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