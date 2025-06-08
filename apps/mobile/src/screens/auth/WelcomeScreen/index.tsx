import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View style={styles.content}>
        <Text variant="h1" style={{ textAlign: 'center' }}>
          Welcome to Somni
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Unlock the world of your dreams. Your personal AI dream journal
          awaits.
        </Text>
        <Button
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('SignUp')}
        >
          Get Started
        </Button>
        <View style={{ marginTop: theme.spacing.medium }}>
          <Button variant="ghost" onPress={() => navigation.navigate('SignIn')}>
            I Already Have an Account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  subtitle: { textAlign: 'center', marginVertical: 24, lineHeight: 22 },
});
