import React, { useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../../atoms/Text';
import { useOfflineQueueStore } from '@somni/stores';
import { useStyles } from './UploadProgress.styles';

interface UploadProgressProps {
  recordingId?: string;
}

interface CompletedUpload {
  id: string;
  completedAt: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ recordingId }) => {
  const { recordings, uploadProgress } = useOfflineQueueStore();
  const styles = useStyles();
  
  // Track completed uploads to show success message
  const [completedUploads, setCompletedUploads] = useState<CompletedUpload[]>([]);
  const [fadeAnims] = useState<{ [key: string]: Animated.Value }>({});

  // Get currently uploading recordings
  const uploadingRecordings = recordingId 
    ? recordings.filter(r => r.id === recordingId && r.status === 'uploading')
    : recordings.filter(r => r.status === 'uploading');

  // Check for newly completed uploads
  useEffect(() => {
    recordings.forEach(recording => {
      if (recording.status === 'completed' && 
          !completedUploads.find(c => c.id === recording.id) &&
          recording.uploadDuration) {
        
        // Add to completed list
        setCompletedUploads(prev => [...prev, { 
          id: recording.id, 
          completedAt: Date.now() 
        }]);

        // Initialize fade animation
        if (!fadeAnims[recording.id]) {
          fadeAnims[recording.id] = new Animated.Value(1);
        }

        // Remove after 3 seconds with fade out
        setTimeout(() => {
          Animated.timing(fadeAnims[recording.id], {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setCompletedUploads(prev => prev.filter(c => c.id !== recording.id));
          });
        }, 2500);
      }
    });
  }, [recordings]);

  // Show completed uploads that are less than 3 seconds old
  const recentlyCompleted = completedUploads.filter(
    c => Date.now() - c.completedAt < 3000
  );

  if (uploadingRecordings.length === 0 && recentlyCompleted.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Uploading recordings */}
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

      {/* Completed uploads */}
      {recentlyCompleted.map((completed) => {
        const recording = recordings.find(r => r.id === completed.id);
        if (!recording) return null;

        return (
          <Animated.View 
            key={completed.id} 
            style={[
              styles.progressItem,
              styles.completedItem,
              { opacity: fadeAnims[completed.id] || 1 }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.completedHeader}>
                <Text style={styles.checkmark}>✓</Text>
                <Text variant="caption" style={styles.completedTitle}>
                  Upload Complete
                </Text>
              </View>
              <Text variant="caption" style={styles.completedSize}>
                {formatBytes(recording.fileSize)}
              </Text>
            </View>
          </Animated.View>
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