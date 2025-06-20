import React from 'react';
import { View } from 'react-native';
import { Button } from '../../atoms/Button';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './RecordingActions.styles';

interface RecordingActionsProps {
  onAccept: () => void;
  onSaveLater: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const RecordingActions: React.FC<RecordingActionsProps> = ({
  onAccept,
  onSaveLater,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation('dreams');
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <Button
          action="primary"
          variant="solid"
          size="lg"
          onPress={onAccept}
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {String(t('record.transcribeNow'))}
        </Button>
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          action="secondary"
          variant="outline"
          size="lg"
          onPress={onSaveLater}
          isDisabled={isLoading}
        >
          {String(t('record.transcribeLater'))}
        </Button>
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          action="negative"
          variant="link"
          size="lg"
          onPress={onCancel}
          isDisabled={isLoading}
        >
          {String(t('record.cancelRecording'))}
        </Button>
      </View>
    </View>
  );
};