import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { MultiSelectChip } from '../../../components/molecules/MultiSelectChip';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';

const PRIVACY_OPTIONS = [
  {
    key: 'private' as const,
    label: 'Private',
    description: 'Only you can see your dreams',
  },
  {
    key: 'anonymous' as const,
    label: 'Anonymous',
    description: 'Share dreams anonymously for insights',
  },
];

export const OnboardingPrivacyScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();
  const [selectedPrivacy, setSelectedPrivacy] = useState<
    'private' | 'anonymous'
  >(data.privacy?.defaultVisibility || 'private');

  const handleSelect = (privacy: 'private' | 'anonymous') => {
    setSelectedPrivacy(privacy);
  };

  const handleNext = () => {
    updateData({ privacy: { defaultVisibility: selectedPrivacy } });
    navigation.navigate('OnboardingCompleteScreen');
  };

  return (
    <OnboardingScreenLayout
      title="Choose your privacy setting"
      description="You can change this anytime in settings."
      onNext={handleNext}
      isNextDisabled={false}
    >
      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          {PRIVACY_OPTIONS.map((option) => (
            <View key={option.key} style={styles.optionWrapper}>
              <MultiSelectChip
                label={option.label}
                isSelected={selectedPrivacy === option.key}
                onPress={() => handleSelect(option.key)}
              />
            </View>
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
      gap: theme.spacing.medium,
    },
    optionWrapper: {
      marginBottom: theme.spacing.small,
    },
  });
};
