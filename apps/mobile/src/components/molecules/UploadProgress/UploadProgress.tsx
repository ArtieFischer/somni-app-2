import React from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../../atoms/Text';
import { useOfflineQueueStore } from '@somni/stores';
import { useStyles } from './UploadProgress.styles';

interface UploadProgressProps {
  recordingId?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ recordingId }) => {
  const { recordings, uploadProgress } = useOfflineQueueStore();
  const styles = useStyles();

  // Get currently uploading recordings
  const uploadingRecordings = recordingId 
    ? recordings.filter(r => r.id === recordingId && r.status === 'uploading')
    : recordings.filter(r => r.status === 'uploading');

  if (uploadingRecordings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {uploadingRecordings.map((recording) => {
        const progress = uploadProgress[recording.id] || { percentage: 0, loaded: 0, total: recording.fileSize };
        
        return (
          <View key={recording.id} style={styles.progressItem}>
            <View style={styles.header}>
              <Text variant="caption" style={styles.title}>
                Uploading Dream
              </Text>
              <Text variant="caption" style={styles.percentage}>
                {progress.percentage.toFixed(0)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: `${progress.percentage}%` }
                ]}
              />
            </View>
            
            <View style={styles.footer}>
              <Text variant="caption" style={styles.sizeText}>
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
              </Text>
              {progress.percentage > 0 && recording.lastAttempt && (
                <Text variant="caption" style={styles.speedText}>
                  {calculateSpeed(progress.loaded, recording.lastAttempt)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function calculateSpeed(loaded: number, startTime: string): string {
  const elapsed = Date.now() - new Date(startTime).getTime();
  const bytesPerSecond = loaded / (elapsed / 1000);
  
  if (bytesPerSecond < 1024) return bytesPerSecond.toFixed(0) + ' B/s';
  if (bytesPerSecond < 1024 * 1024) return (bytesPerSecond / 1024).toFixed(1) + ' KB/s';
  return (bytesPerSecond / (1024 * 1024)).toFixed(1) + ' MB/s';
}