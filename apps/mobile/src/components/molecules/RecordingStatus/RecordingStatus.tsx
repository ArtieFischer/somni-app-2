import React from 'react';
import { View } from 'react-native';
import { Text } from '../../atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './RecordingStatus.styles';

interface RecordingStatusProps {
  isRecording: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  hasPendingRecording: boolean;
  isOnline: boolean;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({
  isRecording,
  isProcessing,
  isTranscribing,
  hasPendingRecording,
  isOnline,
}) => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();

  const getStatusText = () => {
    if (isTranscribing) {
      return String(t('record.waitingForService'));
    }
    if (isProcessing) {
      return String(t('record.processing'));
    }
    if (isRecording) {
      return String(t('record.whisperMode'));
    }
    if (hasPendingRecording) {
      return String(t('record.acceptOrCancel'));
    }
    return String(t('record.button.start'));
  };

  return (
    <View style={styles.container}>
      <Text variant="body" color="secondary" style={styles.instruction}>
        {getStatusText()}
      </Text>
      
      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Text variant="caption" style={styles.offlineText}>
            📡 {String(t('record.offline'))}
          </Text>
        </View>
      )}

      {(isProcessing || isTranscribing) && (
        <Text variant="caption" color="secondary" style={styles.processingText}>
          {isTranscribing ? String(t('record.transcribing')) : String(t('record.processing'))}
        </Text>
      )}
    </View>
  );
};