import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Text, Button } from '../../../components/atoms';

interface StepLucidExperienceProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const experienceLevels = [
  { value: 'never', label: 'Never had a lucid dream' },
  { value: 'accidental', label: 'Had a few accidental lucid dreams' },
  { value: 'occasional', label: 'Occasionally have lucid dreams' },
  { value: 'regular', label: 'Regularly practice lucid dreaming' },
  { value: 'expert', label: 'Expert lucid dreamer' },
];

export const StepLucidExperience: React.FC<StepLucidExperienceProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  
  const handleSelect = (value: string) => {
    onUpdate({ lucidDreamingExperience: value });
  };

  const handleNext = () => {
    if (!data.lucidDreamingExperience) {
      // Default to 'never' if not selected
      onUpdate({ lucidDreamingExperience: 'never' });
    }
    onNext();
  };

  const styles = {
    container: {
      flex: 1,
      padding: theme.spacing.large,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    optionsContainer: {
      gap: theme.spacing.medium,
    },
    option: {
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.medium,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      marginBottom: theme.spacing.medium,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background.elevated,
    },
    optionText: {
      color: theme.colors.text.primary,
      textAlign: 'center' as const,
    },
    optionTextSelected: {
      color: theme.colors.primary,
    },
    footer: {
      marginTop: 'auto' as const,
      paddingTop: theme.spacing.xl,
      flexDirection: 'row' as const,
      gap: theme.spacing.medium,
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
          {t('lucidExperience.title') as string}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text.secondary }}>
          {t('lucidExperience.description') as string}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level.value}
            onPress={() => handleSelect(level.value)}
            style={[
              styles.option,
              data.lucidDreamingExperience === level.value && styles.optionSelected,
            ]}
          >
            <Text
              variant="body"
              style={[
                styles.optionText,
                data.lucidDreamingExperience === level.value && styles.optionTextSelected,
              ]}
            >
              {(t(`lucidExperience.levels.${level.value}`, level.label) as string)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          variant="outline"
          size="md"
          onPress={onPrevious}
          style={{ flex: 1 }}
        >
          {t('common.back') as string}
        </Button>
        <Button
          variant="solid"
          size="md"
          onPress={handleNext}
          style={{ flex: 1 }}
        >
          {t('common.continue') as string}
        </Button>
      </View>
    </ScrollView>
  );
};