import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
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
  const { profile } = useAuth();

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
    
    // Skip goals screen and check if user is interested in lucid dreaming
    if (profile?.interested_in_lucid_dreaming === 'yes' || profile?.interested_in_lucid_dreaming === 'dont_know_yet') {
      navigation.navigate('OnboardingLucidityScreen');
    } else {
      navigation.navigate('OnboardingCompleteScreen');
    }
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingScreenLayout
      title={String(t('sleepSchedule.title'))}
      description={String(t('sleepSchedule.description'))}
      onNext={handleNext}
      onBack={handleBack}
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
            <View style={Platform.OS === 'ios' ? styles.datePickerWrapper : {}}>
              <DateTimePicker
                value={bedtime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: any, selectedTime?: Date) => {
                  setShowBedtimePicker(Platform.OS === 'ios');
                  if (selectedTime) setBedtime(selectedTime);
                }}
                textColor={theme.colors.text.primary}
                themeVariant="light"
              />
            </View>
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
            <View style={Platform.OS === 'ios' ? styles.datePickerWrapper : {}}>
              <DateTimePicker
                value={wakeTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: any, selectedTime?: Date) => {
                  setShowWakeTimePicker(Platform.OS === 'ios');
                  if (selectedTime) setWakeTime(selectedTime);
                }}
                textColor={theme.colors.text.primary}
                themeVariant="light"
              />
            </View>
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
      backgroundColor: theme.colors.purple[100],
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderWidth: 2,
      borderColor: theme.colors.purple[300],
    },
    timeText: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '400' as any,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    datePickerWrapper: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.medium,
      marginTop: theme.spacing.small,
      padding: theme.spacing.small,
    },
  });
};
