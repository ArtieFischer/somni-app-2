import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { MultiSelectChip } from '../../../components/molecules/MultiSelectChip';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Theme } from '@somni/theme';

export const OnboardingGoalsScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    data.dreamGoals || [],
  );

  const GOALS = [
    String(t('goals.options.rememberDreams')),
    String(t('goals.options.lucidDreaming')),
    String(t('goals.options.dreamMeaning')),
    String(t('goals.options.sleepQuality')),
  ];

  const handleSelect = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = () => {
    updateData({ dreamGoals: selectedGoals });
    navigation.navigate('OnboardingLucidityScreen');
  };

  return (
    <OnboardingScreenLayout
      title={String(t('goals.title'))}
      description={String(t('goals.description'))}
      onNext={handleNext}
      isNextDisabled={selectedGoals.length === 0}
    >
      <View style={styles.container}>
        <View style={styles.chipsContainer}>
          {GOALS.map((goal) => (
            <MultiSelectChip
              key={goal}
              label={goal}
              isSelected={selectedGoals.includes(goal)}
              onPress={() => handleSelect(goal)}
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
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
  });
};
