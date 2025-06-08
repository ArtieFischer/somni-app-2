import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';

interface OnboardingSleepScheduleScreenProps {}

export const OnboardingSleepScheduleScreen: React.FC<
  OnboardingSleepScheduleScreenProps
> = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();

  const [bedtime, setBedtime] = useState(
    data.sleepSchedule?.bedtime
      ? new Date(`2024-01-01T${data.sleepSchedule.bedtime}:00`)
      : new Date(),
  );
  const [wakeTime, setWakeTime] = useState(
    data.sleepSchedule?.wakeTime
      ? new Date(`2024-01-01T${data.sleepSchedule.wakeTime}:00`)
      : new Date(),
  );
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleNext = () => {
    const sleepSchedule = {
      bedtime: formatTime(bedtime),
      wakeTime: formatTime(wakeTime),
    };
    updateData({ sleepSchedule });
    navigation.navigate('OnboardingGoalsScreen');
  };

  return (
    <OnboardingScreenLayout
      title={String(t('sleepSchedule.title'))}
      description={String(t('sleepSchedule.description'))}
      onNext={handleNext}
      isNextDisabled={false}
    >
      <View style={styles.container}>
        <View style={styles.timeSection}>
          <Text style={styles.label}>
            {String(t('sleepSchedule.bedtimeLabel'))}
          </Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowBedtimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(bedtime)}</Text>
          </TouchableOpacity>
          {showBedtimePicker && (
            <DateTimePicker
              value={bedtime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, selectedTime?: Date) => {
                setShowBedtimePicker(Platform.OS === 'ios');
                if (selectedTime) setBedtime(selectedTime);
              }}
            />
          )}
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.label}>
            {String(t('sleepSchedule.wakeTimeLabel'))}
          </Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowWakeTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
          </TouchableOpacity>
          {showWakeTimePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, selectedTime?: Date) => {
                setShowWakeTimePicker(Platform.OS === 'ios');
                if (selectedTime) setWakeTime(selectedTime);
              }}
            />
          )}
        </View>
      </View>
    </OnboardingScreenLayout>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.large,
    },
    timeSection: {
      marginBottom: theme.spacing.large,
    },
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.small,
    },
    timeButton: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    timeText: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '400' as any,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });
};
