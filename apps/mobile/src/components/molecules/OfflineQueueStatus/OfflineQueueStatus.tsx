import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { useOfflineRecordingQueue } from '../../../hooks/useOfflineRecordingQueue';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useStyles } from './OfflineQueueStatus.styles';

export const OfflineQueueStatus: React.FC = () => {
  const { t } = useTranslation('dreams');
  const { isConnected } = useNetworkStatus();
  const {
    pendingCount,
    failedCount,
    totalSize,
    isProcessing,
    retryFailedRecordings,
    processQueue,
    currentUpload,
  } = useOfflineRecordingQueue();

  const styles = useStyles();

  if (pendingCount === 0 && failedCount === 0 && !currentUpload) {
    return null;
  }

  const getStatusColor = () => {
    if (failedCount > 0) return styles.statusError;
    if (isProcessing || currentUpload) return styles.statusProcessing;
    if (!isConnected) return styles.statusOffline;
    return styles.statusPending;
  };

  const getStatusText = () => {
    if (currentUpload) {
      return `Uploading... ${currentUpload.progress.percentage.toFixed(0)}%`;
    }
    
    if (isProcessing) {
      return t('offline.uploading');
    }
    
    if (failedCount > 0) {
      return t('offline.failed', { count: failedCount });
    }
    
    if (!isConnected) {
      return t('offline.noConnection', { count: pendingCount });
    }
    
    return t('offline.pending', { count: pendingCount });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, getStatusColor()]} />
        <Text variant="caption" style={styles.statusText}>
          {getStatusText()}
        </Text>
        
        {totalSize > 0 && (
          <Text variant="caption" style={styles.sizeText}>
            ({formatFileSize(totalSize)})
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {failedCount > 0 && isConnected && (
          <Button
            variant="secondary"
            size="small"
            onPress={retryFailedRecordings}
            disabled={isProcessing}
          >
            {t('offline.retry')}
          </Button>
        )}
        
        {pendingCount > 0 && isConnected && !isProcessing && (
          <Button
            variant="secondary"
            size="small"
            onPress={processQueue}
          >
            Upload Now
          </Button>
        )}
      </View>
    </View>
  );
};