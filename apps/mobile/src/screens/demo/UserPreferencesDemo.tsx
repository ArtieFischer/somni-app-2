import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/atoms';
import { useAuth } from '../../hooks/useAuth';

/**
 * Demo screen showing how to access user's onboarding answers
 * 
 * The user's onboarding answers are stored in the user profile and can be accessed via:
 * 1. useAuth hook - provides access to the user profile
 * 2. profile.improve_sleep_quality - 'yes' | 'no' | 'not_sure'
 * 3. profile.interested_in_lucid_dreaming - 'yes' | 'no' | 'dont_know_yet'
 */
export const UserPreferencesDemo: React.FC = () => {
  const { profile, isLoading } = useAuth();

  // Helper function to format preference values
  const formatPreference = (value?: string) => {
    switch (value) {
      case 'yes': return 'Yes';
      case 'no': return 'No';
      case 'not_sure': return 'Not sure';
      case 'dont_know_yet': return "Don't know yet";
      default: return 'Not specified';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>No user profile found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="h2" style={styles.title}>
          User Onboarding Preferences
        </Text>
        
        <View style={styles.preferenceItem}>
          <Text variant="label" style={styles.label}>
            Improve Sleep Quality:
          </Text>
          <Text variant="body" style={styles.value}>
            {formatPreference(profile.improve_sleep_quality)}
          </Text>
          <Text variant="caption" color="secondary" style={styles.rawValue}>
            Raw value: {profile.improve_sleep_quality || 'undefined'}
          </Text>
        </View>

        <View style={styles.preferenceItem}>
          <Text variant="label" style={styles.label}>
            Interested in Lucid Dreaming:
          </Text>
          <Text variant="body" style={styles.value}>
            {formatPreference(profile.interested_in_lucid_dreaming)}
          </Text>
          <Text variant="caption" color="secondary" style={styles.rawValue}>
            Raw value: {profile.interested_in_lucid_dreaming || 'undefined'}
          </Text>
        </View>

        <View style={styles.codeExample}>
          <Text variant="label" style={styles.codeTitle}>
            How to use in your components:
          </Text>
          <View style={styles.codeBlock}>
            <Text variant="caption" style={styles.code}>
              {`import { useAuth } from '../../hooks/useAuth';

const MyComponent = () => {
  const { profile } = useAuth();
  
  // Check if user wants to improve sleep
  if (profile?.improve_sleep_quality === 'yes') {
    // Show sleep improvement features
  }
  
  // Check lucid dreaming interest
  if (profile?.interested_in_lucid_dreaming === 'yes') {
    // Show lucid dreaming features
  }
};`}
            </Text>
          </View>
        </View>

        <View style={styles.allPreferences}>
          <Text variant="label" style={styles.label}>
            All Profile Data:
          </Text>
          <Text variant="caption" style={styles.json}>
            {JSON.stringify(profile, null, 2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  preferenceItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  rawValue: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  codeExample: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  codeTitle: {
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#282c34',
    padding: 12,
    borderRadius: 4,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#abb2bf',
  },
  allPreferences: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  json: {
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 8,
  },
});

export default UserPreferencesDemo;