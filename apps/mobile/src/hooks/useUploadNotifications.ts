import { useEffect, useRef } from 'react';
import { useOfflineQueueStore } from '@somni/stores';
import { Alert } from 'react-native';
import { useTranslation } from './useTranslation';

interface UseUploadNotificationsOptions {
  onUploadComplete?: (recordingId: string) => void;
  onUploadFailed?: (recordingId: string, error: string) => void;
}

export const useUploadNotifications = (options?: UseUploadNotificationsOptions) => {
  const { recordings } = useOfflineQueueStore();
  const { t } = useTranslation('common');
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
          String(t('notifications.uploadComplete.title')),
          String(t('notifications.uploadComplete.message')),
          [{ text: String(t('actions.ok')) }],
          { cancelable: true }
        );
        
        options?.onUploadComplete?.(recording.id);
      }
      
      // Recording just failed
      if (prevRecording?.status === 'uploading' && recording.status === 'failed') {
        const errorMessage = recording.error || 'Upload failed';
        
        Alert.alert(
          String(t('notifications.uploadFailed.title')),
          `${errorMessage}\n\n${String(t('notifications.uploadFailed.message'))}`,
          [{ text: String(t('actions.ok')) }],
          { cancelable: true }
        );
        
        options?.onUploadFailed?.(recording.id, errorMessage);
      }
    });

    // Update reference for next comparison
    previousRecordings.current = [...recordings];
  }, [recordings, options, t]);

  return null;
};