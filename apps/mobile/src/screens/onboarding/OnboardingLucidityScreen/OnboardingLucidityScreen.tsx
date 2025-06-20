import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { MultiSelectChip } from '../../../components/molecules/MultiSelectChip';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Theme } from '@somni/theme';

export const OnboardingLucidityScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();
  const [selectedExperience, setSelectedExperience] = useState<string>(
    data.lucidityExperience || '',
  );

  const EXPERIENCE_LEVELS = [
    String(t('lucidity.options.beginner')),
    String(t('lucidity.options.few')),
    String(t('lucidity.options.regular')),
    String(t('lucidity.options.experienced')),
  ];

  const handleSelect = (experience: string) => {
    setSelectedExperience(experience);
  };

  const handleNext = () => {
    updateData({ lucidityExperience: selectedExperience });
    // Skip privacy screen and go directly to complete
    navigation.navigate('OnboardingCompleteScreen');
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingScreenLayout
      title={String(t('lucidity.title'))}
      description={String(t('lucidity.description'))}
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!selectedExperience}
    >
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          {EXPERIENCE_LEVELS.map((experience) => (
            <MultiSelectChip
              key={experience}
              label={experience}
              isSelected={selectedExperience === experience}
              onPress={() => handleSelect(experience)}
            />
          ))}
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
    optionsContainer: {
      flexDirection: 'column',
      gap: theme.spacing.small,
    },
  });
};
