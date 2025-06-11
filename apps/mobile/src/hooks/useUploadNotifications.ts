// apps/mobile/src/hooks/useUploadNotifications.ts
import { useEffect, useRef } from 'react';
import { useOfflineQueueStore } from '@somni/stores';
import { Alert } from 'react-native';

interface UseUploadNotificationsOptions {
  onUploadComplete?: (recordingId: string) => void;
  onUploadFailed?: (recordingId: string, error: string) => void;
}

export const useUploadNotifications = (options?: UseUploadNotificationsOptions) => {
  const { recordings } = useOfflineQueueStore();
  const previousRecordings = useRef<typeof recordings>([]);

  useEffect(() => {
    const prevRecordings = previousRecordings.current;
    
    // Check for newly completed uploads
    recordings.forEach(recording => {
      const prevRecording = prevRecordings.find(r => r.id === recording.id);
      
      // Recording just completed
      if (prevRecording?.status === 'uploading' && recording.status === 'completed') {
        // Show success notification
        Alert.alert(
          '✅ Upload Complete',
          'Your dream has been successfully uploaded and processed.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
        
        options?.onUploadComplete?.(recording.id);
      }
      
      // Recording just failed
      if (prevRecording?.status === 'uploading' && recording.status === 'failed') {
        const errorMessage = recording.error || 'Upload failed';
        
        Alert.alert(
          '❌ Upload Failed',
          `${errorMessage}\n\nThe recording will be retried automatically when connection improves.`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
        
        options?.onUploadFailed?.(recording.id, errorMessage);
      }
    });

    // Update reference for next comparison
    previousRecordings.current = [...recordings];
  }, [recordings, options]);

  return null;
};