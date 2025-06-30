import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import SomniLogo from '../../../../../../assets/logo_somni_full.svg';
import { DreamyBackground } from '../../../components/DreamyRecordKit';

interface NavigationType {
  navigate: (screen: string) => void;
}

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationType>();
  const theme = useTheme();
  const { t } = useTranslation('welcome');
  const styles = createStyles(theme);

  return (
    <View style={styles.fullScreenContainer}>
      <DreamyBackground active={true} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
        <View style={styles.logoContainer}>
          <SomniLogo width={300} height={100} />
        </View>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {String(t('subtitle'))}
        </Text>
        <Button
          variant="solid"
          size="md"
          onPress={() => navigation.navigate('SignUp')}
        >
          {String(t('getStarted'))}
        </Button>
        <View style={styles.secondaryButtonContainer}>
          <Button variant="link" onPress={() => navigation.navigate('SignIn')}>
            {String(t('alreadyHaveAccount'))}
          </Button>
        </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.large,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
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
