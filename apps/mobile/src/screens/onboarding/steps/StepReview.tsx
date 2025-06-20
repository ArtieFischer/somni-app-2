import React from 'react';
import { View, ViewStyle, ScrollView, Image } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import type { OnboardingData } from '../OnboardingScreen';

interface StepReviewProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
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
      case 'prefer_not_to_say': return 'Prefer not to say';
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
  };

  return (
    <View style={styles.container}>
      <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
        Review Your Information
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.medium }}>
        Make sure everything looks good
      </Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {data.avatar_url && (
          <View style={styles.avatarSection}>
            <Image source={{ uri: data.avatar_url }} style={styles.avatar} />
          </View>
        )}

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            Account Information
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Email</Text>
            <Text variant="caption">{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Username</Text>
            <Text variant="caption">@{data.username}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            Personal Details
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Display Name</Text>
            <Text variant="caption">{data.display_name}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Sex</Text>
            <Text variant="caption">{getSexLabel(data.sex)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Date of Birth</Text>
            <Text variant="caption">{data.date_of_birth}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Language</Text>
            <Text variant="caption">English</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            Dream Settings
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Dream Interpreter</Text>
            <Text variant="caption">{getInterpreterName(data.dream_interpreter)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Improve Sleep Quality?</Text>
            <Text variant="caption">{getPreferenceLabel(data.improve_sleep_quality)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="caption" color="secondary">Interested in Lucid Dreaming?</Text>
            <Text variant="caption">{getPreferenceLabel(data.interested_in_lucid_dreaming)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          action="secondary"
          onPress={onPrevious}
          style={{ flex: 1 }}
          isDisabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onPress={onSubmit}
          isLoading={isSubmitting}
          style={{ flex: 1 }}
        >
          Create Account
        </Button>
      </View>
    </View>
  );
};