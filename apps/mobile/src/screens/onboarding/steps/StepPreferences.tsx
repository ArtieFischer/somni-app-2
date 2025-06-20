import React from 'react';
import { View, ViewStyle, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import type { OnboardingData } from '../OnboardingScreen';

interface StepPreferencesProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepPreferences: React.FC<StepPreferencesProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');

  const [sleepQuality, setSleepQuality] = React.useState(data.improve_sleep_quality);
  const [lucidDreaming, setLucidDreaming] = React.useState(data.interested_in_lucid_dreaming);

  const handleContinue = () => {
    if (sleepQuality && lucidDreaming) {
      onUpdate({
        improve_sleep_quality: sleepQuality,
        interested_in_lucid_dreaming: lucidDreaming,
      });
      onNext();
    }
  };

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.xl,
    },
    question: {
      marginBottom: theme.spacing.xl,
    },
    optionContainer: {
      gap: theme.spacing.small,
      marginTop: theme.spacing.medium,
    },
    option: {
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 2,
      borderColor: theme.colors.border.secondary,
      backgroundColor: theme.colors.background.elevated,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      marginTop: theme.spacing.xl,
      paddingVertical: theme.spacing.large,
    },
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
        Your Sleep Goals
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.xl }}>
        Help us tailor your experience
      </Text>

      <View style={styles.question}>
        <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
          Do you want to improve your sleep quality?
        </Text>
        <View style={styles.optionContainer}>
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'not_sure', label: 'Not sure' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                sleepQuality === option.value && styles.optionSelected,
              ]}
              onPress={() => setSleepQuality(option.value as any)}
            >
              <Text
                variant="body"
                style={{
                  color: sleepQuality === option.value
                    ? theme.colors.primary
                    : theme.colors.text.secondary,
                  fontWeight: sleepQuality === option.value ? '600' : '400',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.question}>
        <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
          Are you interested in lucid dreaming?
        </Text>
        <View style={styles.optionContainer}>
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'dont_know_yet', label: "Don't know yet" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                lucidDreaming === option.value && styles.optionSelected,
              ]}
              onPress={() => setLucidDreaming(option.value as any)}
            >
              <Text
                variant="body"
                style={{
                  color: lucidDreaming === option.value
                    ? theme.colors.primary
                    : theme.colors.text.secondary,
                  fontWeight: lucidDreaming === option.value ? '600' : '400',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          action="secondary"
          onPress={onPrevious}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          onPress={handleContinue}
          isDisabled={!sleepQuality || !lucidDreaming}
          style={{ flex: 1 }}
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
};