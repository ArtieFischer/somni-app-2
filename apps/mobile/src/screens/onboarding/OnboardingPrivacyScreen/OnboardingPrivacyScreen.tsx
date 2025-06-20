import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { MultiSelectChip } from '../../../components/molecules/MultiSelectChip';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Theme } from '@somni/theme';

export const OnboardingPrivacyScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const styles = useStyles(theme);
  const { data, updateData } = useOnboardingStore();
  const [selectedPrivacy, setSelectedPrivacy] = useState<
    'private' | 'anonymous'
  >(data.privacy?.defaultVisibility || 'private');

  const PRIVACY_OPTIONS = [
    {
      key: 'private' as const,
      label: String(t('privacy.options.private')),
    },
    {
      key: 'anonymous' as const,
      label: String(t('privacy.options.anonymous')),
    },
  ];

  const handleSelect = (privacy: 'private' | 'anonymous') => {
    setSelectedPrivacy(privacy);
  };

  const handleNext = () => {
    updateData({ privacy: { defaultVisibility: selectedPrivacy } });
    navigation.navigate('OnboardingCompleteScreen');
  };

  return (
    <OnboardingScreenLayout
      title={String(t('privacy.title'))}
      description={String(t('privacy.description'))}
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
