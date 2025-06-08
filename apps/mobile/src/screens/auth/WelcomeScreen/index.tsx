import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';

interface NavigationType {
  navigate: (screen: string) => void;
}

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const theme = useTheme();
  const { t } = useTranslation('welcome');
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {String(t('title'))}
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {String(t('subtitle'))}
        </Text>
        <Button
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('SignUp')}
        >
          {String(t('getStarted'))}
        </Button>
        <View style={styles.secondaryButtonContainer}>
          <Button variant="ghost" onPress={() => navigation.navigate('SignIn')}>
            {String(t('alreadyHaveAccount'))}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.large,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      textAlign: 'center',
      marginVertical: theme.spacing.large,
      lineHeight: theme.typography.body.lineHeight || 22,
    },
    secondaryButtonContainer: {
      marginTop: theme.spacing.medium,
    },
  });
