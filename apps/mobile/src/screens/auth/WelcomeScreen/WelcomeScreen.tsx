import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, Button } from '@components/atoms';
import { useTranslation } from '@hooks/useTranslation';
import { useStyles } from './WelcomeScreen.styles';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation('common');
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h1" style={styles.title}>
            {t('app.name')}
          </Text>
          <Text variant="body" color="secondary" style={styles.tagline}>
            {t('app.tagline')}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button 
            variant="primary" 
            size="large" 
            onPress={() => navigation.navigate('SignUp')}
            style={styles.primaryButton}
          >
            Get Started
          </Button>
          
          <Button 
            variant="ghost" 
            size="large"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.secondaryButton}
          >
            I Already Have an Account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};