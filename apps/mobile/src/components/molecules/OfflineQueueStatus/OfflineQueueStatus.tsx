import React, { useState } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { useOfflineRecordingQueue } from '../../../hooks/useOfflineRecordingQueue';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { UploadProgress } from '../UploadProgress';
import { useStyles } from './OfflineQueueStatus.styles';

export const OfflineQueueStatus: React.FC = () => {
  const { t } = useTranslation('dreams');
  const { isConnected } = useNetworkStatus();
  const {
    pendingCount,
    failedCount,
    uploadingCount,
    totalSize,
    isProcessing,
    retryFailedRecordings,
    processQueue,
    currentUpload,
  } = useOfflineRecordingQueue();

  const [isExpanded, setIsExpanded] = useState(false);
  const styles = useStyles();

  const totalCount = pendingCount + failedCount + uploadingCount;

  if (totalCount === 0 && !currentUpload) {
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
    
    if (uploadingCount > 0) {
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
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, getStatusColor()]} />
          <View style={styles.textContainer}>
            <Text variant="caption" style={styles.statusText}>
              {getStatusText()}
            </Text>
            
            {totalSize > 0 && (
              <Text variant="caption" style={styles.sizeText}>
                {formatFileSize(totalSize)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {failedCount > 0 && isConnected && (
            <Button
              variant="secondary"
              size="small"
              onPress={(e) => {
                e.stopPropagation();
                retryFailedRecordings();
              }}
              disabled={isProcessing}
            >
              {t('offline.retry')}
            </Button>
          )}
          
          {pendingCount > 0 && isConnected && !isProcessing && (
            <Button
              variant="secondary"
              size="small"
              onPress={(e) => {
                e.stopPropagation();
                processQueue();
              }}
            >
              Upload Now
            </Button>
          )}

          <View style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
            <Text>▼</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Upload Progress */}
      {uploadingCount > 0 && <UploadProgress />}

      {/* Expanded Stats */}
      {isExpanded && (
        <Animated.View style={styles.expandedContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="h3" style={styles.statValue}>
                {totalCount}
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Total Queue
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="h3" style={styles.statValue}>
                {pendingCount}
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Pending
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="h3" style={styles.statValue}>
                {failedCount}
              </Text>
              <Text variant="caption" style={styles.statLabel}>
                Failed
              </Text>
            </View>
          </View>

          <Text variant="caption" style={styles.lastProcessed}>
            Tap to collapse • Auto-retry enabled
          </Text>
        </Animated.View>
      )}
    </View>
  );
};