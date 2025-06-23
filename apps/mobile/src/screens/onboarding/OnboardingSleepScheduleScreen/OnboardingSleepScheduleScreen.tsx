import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable } from 'react-native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../../../hooks/useTranslation';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { Theme } from '@somni/theme';
import { TimePicker } from '../../../components/molecules';
import Ionicons from '@expo/vector-icons/Ionicons';

interface OnboardingSleepScheduleScreenProps {}

export const OnboardingSleepScheduleScreen: React.FC<
  OnboardingSleepScheduleScreenProps
> = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();
  const { profile } = useAuth();

  // Parse existing times or use defaults
  const parseTimeString = (timeStr?: string, defaultTime: string): Date => {
    if (!timeStr) {
      return new Date(`2024-01-01T${defaultTime}:00`);
    }
    // Handle both "10:00 PM" and "22:00" formats
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, period] = timeStr.split(' ');
      const [hoursStr, minutes] = time.split(':');
      let hours = parseInt(hoursStr);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return new Date(`2024-01-01T${hours.toString().padStart(2, '0')}:${minutes}:00`);
    }
    return new Date(`2024-01-01T${timeStr}:00`);
  };

  const [bedtime, setBedtime] = useState(
    parseTimeString(data.sleepSchedule?.bedtime, '22:00')
  );
  const [wakeTime, setWakeTime] = useState(
    parseTimeString(data.sleepSchedule?.wakeTime, '06:00')
  );

  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleNext = () => {
    const sleepSchedule = {
      bedtime: formatTime(bedtime),
      wakeTime: formatTime(wakeTime),
    };
    updateData({ sleepSchedule });
    
    // Navigate to lucidity screen
    navigation.navigate('OnboardingLucidityScreen');
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
      backButtonVariant="outline"
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wake Time */}
        <View style={styles.timeSection}>
          <Text style={styles.label}>
            {String(t('sleepSchedule.wakeTimeLabel'))}
          </Text>
          <Text style={styles.sublabel}>
            When do you usually wake up?
          </Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowWakeTimePicker(true)}
          >
            <Ionicons 
              name="sunny-outline" 
              size={24} 
              color={theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.text.secondary}
            />
          </Pressable>
        </View>

        {/* Bedtime */}
        <View style={styles.timeSection}>
          <Text style={styles.label}>
            {String(t('sleepSchedule.bedtimeLabel'))}
          </Text>
          <Text style={styles.sublabel}>
            When do you usually go to sleep?
          </Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowBedtimePicker(true)}
          >
            <Ionicons 
              name="moon-outline" 
              size={24} 
              color={theme.colors.primary}
              style={styles.icon}
            />
            <Text style={styles.timeText}>{formatTime(bedtime)}</Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.text.secondary}
            />
          </Pressable>
        </View>

        {/* Sleep Duration Info */}
        <View style={styles.infoContainer}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={theme.colors.text.secondary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            We'll use this information to optimize dream recall reminders and insights about your sleep patterns.
          </Text>
        </View>
      </ScrollView>

      {/* Time Pickers */}
      <TimePicker
        visible={showWakeTimePicker}
        value={wakeTime}
        onChange={setWakeTime}
        onClose={() => setShowWakeTimePicker(false)}
        title="Select Wake Time"
      />
      
      <TimePicker
        visible={showBedtimePicker}
        value={bedtime}
        onChange={setBedtime}
        onClose={() => setShowBedtimePicker(false)}
        title="Select Bedtime"
      />
    </OnboardingScreenLayout>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.xl,
    },
    timeSection: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    sublabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.medium,
    },
    timeButton: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.large,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    icon: {
      marginRight: theme.spacing.medium,
    },
    timeText: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.primary,
      flex: 1,
    },
    infoContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.medium,
    },
    infoIcon: {
      marginRight: theme.spacing.small,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
  });
};