import React from 'react';
import { View } from 'react-native';
import { Button } from '../../atoms/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './RecordingActions.styles';

interface RecordingActionsProps {
  onAccept: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const RecordingActions: React.FC<RecordingActionsProps> = ({
  onAccept,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Button
        variant="primary"
        size="large"
        onPress={onAccept}
        loading={isLoading}
        disabled={isLoading}
        style={styles.acceptButton}
      >
        {String(t('record.acceptRecording'))}
      </Button>
      <Button
        variant="secondary"
        size="medium"
        onPress={onCancel}
        disabled={isLoading}
        style={styles.cancelButton}
      >
        {String(t('record.cancelRecording'))}
      </Button>
    </View>
  );
};