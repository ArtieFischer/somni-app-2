import React from 'react';
import { View, ViewStyle, ScrollView, Image } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';

interface StepReviewProps {
  data: any;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const StepReview: React.FC<StepReviewProps> = ({
  data,
  onUpdate,
  onSubmit,
  onPrevious,
  isSubmitting,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');

  const getInterpreterName = (id?: string) => {
    switch (id) {
      case 'carl': return 'Carl Jung';
      case 'sigmund': return 'Sigmund Freud';
      case 'lakshmi': return 'Lakshmi Devi';
      case 'mary': return 'Mary Whiton';
      default: return 'Unknown';
    }
  };

  const getSexLabel = (sex?: string) => {
    switch (sex) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      case 'unspecified': return 'Prefer not to say';
      default: return 'Not specified';
    }
  };

  const getPreferenceLabel = (value?: string) => {
    switch (value) {
      case 'yes': return 'Yes';
      case 'no': return 'No';
      case 'not_sure': return 'Not sure';
      case 'dont_know_yet': return "Don't know yet";
      default: return 'Not specified';
    }
  };

  const getLucidExperienceLabel = (value?: string) => {
    switch (value) {
      case 'never': return 'Never had a lucid dream';
      case 'accidental': return 'Had a few accidental lucid dreams';
      case 'occasional': return 'Occasionally have lucid dreams';
      case 'regular': return 'Regularly practice lucid dreaming';
      case 'expert': return 'Expert lucid dreamer';
      default: return 'Not specified';
    }
  };

  const getLocationLabel = () => {
    if (data.locationMethod === 'skip') return 'Not sharing location';
    if (data.locationDisplay) return data.locationDisplay;
    if (data.manualLocation) return data.manualLocation;
    return 'Not specified';
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not set';
    
    // Check if it's already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Otherwise try to parse as a date
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return 'Not set';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Not set';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Not specified';
    }
  };

  const getLanguageLabel = (locale?: string) => {
    switch (locale) {
      case 'en': return 'English';
      case 'pl': return 'Polish';
      case 'es': return 'Spanish';
      case 'fr': return 'French';
      default: return locale || 'English';
    }
  };

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.xl,
    },
    scrollView: {
      flex: 1,
      marginTop: theme.spacing.medium,
    },
    section: {
      marginBottom: theme.spacing.large,
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.medium,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.small,
      alignItems: 'center',
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      paddingVertical: theme.spacing.large,
    },
    label: {
      flex: 1,
      marginRight: theme.spacing.small,
    },
    value: {
      flex: 1,
      textAlign: 'right' as const,
    },
  };

  return (
    <View style={styles.container}>
      <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
        {t('review.title') as string}
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.medium }}>
        {t('review.subtitle') as string}
      </Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {data.avatarFile && (
          <View style={styles.avatarSection}>
            <Image source={{ uri: data.avatarFile.uri }} style={styles.avatar} />
          </View>
        )}

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {t('review.accountInfo') as string}
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.email') as string}
            </Text>
            <Text variant="caption" style={styles.value} numberOfLines={1} ellipsizeMode="tail">{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.handle') as string}
            </Text>
            <Text variant="caption" style={styles.value}>@{data.handle}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {t('review.personalDetails') as string}
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.sex') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{getSexLabel(data.sex)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.birthDate') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{formatDate(data.birth_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.language') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{getLanguageLabel(data.locale)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {t('review.dreamSettings') as string}
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.interpreter') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{getInterpreterName(data.dream_interpreter)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.improveSleep') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{getPreferenceLabel(data.improve_sleep_quality)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary" style={styles.label}>
              {t('review.lucidDreaming') as string}
            </Text>
            <Text variant="caption" style={styles.value}>{getPreferenceLabel(data.interested_in_lucid_dreaming)}</Text>
          </View>
        </View>

        {/* Sleep Schedule (if provided) */}
        {(data.bedTime || data.wakeTime) && (
          <View style={styles.section}>
            <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
              {t('review.sleepSchedule') as string}
            </Text>
            <View style={styles.row}>
              <Text variant="caption" color="secondary" style={styles.label}>
                {t('review.bedTime') as string}
              </Text>
              <Text variant="caption" style={styles.value}>{formatTime(data.bedTime)}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="caption" color="secondary" style={styles.label}>
                {t('review.wakeTime') as string}
              </Text>
              <Text variant="caption" style={styles.value}>{formatTime(data.wakeTime)}</Text>
            </View>
          </View>
        )}

        {/* Lucid Experience (if provided) */}
        {data.lucidDreamingExperience && (
          <View style={styles.section}>
            <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
              {t('review.lucidExperience') as string}
            </Text>
            <Text variant="caption">{getLucidExperienceLabel(data.lucidDreamingExperience)}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {t('review.location') as string}
          </Text>
          <Text variant="caption">{getLocationLabel()}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="md"
          onPress={onPrevious}
          style={{ flex: 1 }}
          disabled={isSubmitting}
        >
          {t('common.back') as string}
        </Button>
        <Button
          variant="solid"
          size="md"
          onPress={onSubmit}
          loading={isSubmitting}
          style={{ flex: 1 }}
        >
          {t('review.complete') as string}
        </Button>
      </View>
    </View>
  );
};