import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamRecorder } from '../../../hooks/useDreamRecorder';
import { useStyles } from './RecordScreen.styles';

export const RecordScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const { isRecording, startRecording, stopRecording } = useDreamRecorder();
  const styles = useStyles();

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={handleRecordPress}
          activeOpacity={0.8}
        >
          <Text variant="h2" style={styles.recordButtonText}>
            {isRecording ? '⏹' : '🎙️'}
          </Text>
          <Text variant="body" style={styles.recordButtonLabel}>
            {String(t(isRecording ? 'record.button.stop' : 'record.button.start'))}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};