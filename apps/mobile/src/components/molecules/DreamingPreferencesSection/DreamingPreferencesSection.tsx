import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card } from '../../atoms';
import { 
  Box,
  VStack,
  HStack,
  Heading,
  Switch,
  Divider
} from '@gluestack-ui/themed';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '@somni/stores';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './DreamingPreferencesSection.styles';

const userRepository = new UserRepository();

interface DreamingPreferencesSectionProps {
  onUpdateSuccess?: () => void;
}

export const DreamingPreferencesSection: React.FC<DreamingPreferencesSectionProps> = ({ onUpdateSuccess }) => {
  const { user, profile } = useAuth();
  const { setProfile } = useAuthStore();
  const theme = useTheme();
  const styles = useStyles();
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleInterpreterChange = async (interpreterId: string) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const updatedProfile = await userRepository.update(user.id, {
        dream_interpreter: interpreterId as 'carl' | 'sigmund' | 'lakshmi' | 'mary'
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      Alert.alert('Success', 'Dream guide updated successfully');
    } catch (error) {
      console.error('Interpreter update error:', error);
      Alert.alert('Error', 'Failed to update dream guide. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSleepQualityChange = async (value: boolean) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const currentSettings = profile?.settings || {};
      const newSettings = {
        ...currentSettings,
        improve_sleep_quality: value
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
    } catch (error) {
      console.error('Sleep quality update error:', error);
      Alert.alert('Error', 'Failed to update sleep quality preference.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLucidDreamingChange = async (value: boolean) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const currentSettings = profile?.settings || {};
      const newSettings = {
        ...currentSettings,
        interested_in_lucid_dreaming: value
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
    } catch (error) {
      console.error('Lucid dreaming update error:', error);
      Alert.alert('Error', 'Failed to update lucid dreaming preference.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatSleepSchedule = () => {
    const schedule = profile?.settings?.sleep_schedule;
    if (!schedule) return 'Not set';
    return `${schedule.bed} - ${schedule.wake}`;
  };

  const getInterpreterName = (id?: string) => {
    const interpreters = {
      carl: 'Carl Jung',
      sigmund: 'Sigmund Freud', 
      lakshmi: 'Lakshmi Devi',
      mary: 'Mary Whiton'
    };
    return interpreters[id as keyof typeof interpreters] || 'None selected';
  };

  const PreferenceRow = ({ 
    icon, 
    label, 
    value, 
    onPress,
    rightElement
  }: { 
    icon: string; 
    label: string; 
    value?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.preferenceRow} 
      onPress={onPress}
      disabled={!onPress || isUpdating}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <HStack justifyContent="space-between" alignItems="center" flex={1}>
        <HStack space="md" alignItems="center" flex={1}>
          <Text style={styles.preferenceIcon}>{icon}</Text>
          <VStack flex={1}>
            <Text variant="body" style={styles.preferenceLabel}>
              {label}
            </Text>
            {value && (
              <Text variant="caption" color="secondary" style={styles.preferenceValue}>
                {value}
              </Text>
            )}
          </VStack>
        </HStack>
        <HStack space="sm" alignItems="center">
          {rightElement}
          {onPress && <Text style={styles.chevron}>›</Text>}
        </HStack>
      </HStack>
    </TouchableOpacity>
  );

  return (
    <Card>
      <VStack space="md">
        <Heading size="md" style={styles.sectionTitle}>
          Dreaming Preferences
        </Heading>

        <VStack space="xs">
          {/* Dream Guide (previously Interpreter) */}
          <PreferenceRow
            icon="🧙‍♂️"
            label="Dream Guide"
            value={getInterpreterName(profile?.dream_interpreter)}
            onPress={() => {
              Alert.alert(
                'Select Dream Guide',
                'Choose your preferred dream guide',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Carl Jung', onPress: () => handleInterpreterChange('carl') },
                  { text: 'Sigmund Freud', onPress: () => handleInterpreterChange('sigmund') },
                  { text: 'Lakshmi Devi', onPress: () => handleInterpreterChange('lakshmi') },
                  { text: 'Mary Whiton', onPress: () => handleInterpreterChange('mary') }
                ]
              );
            }}
          />

          <Divider style={styles.divider} />

          {/* Sleep Quality Interest */}
          <PreferenceRow
            icon="💤"
            label="Improve Sleep Quality"
            rightElement={
              <Switch
                value={profile?.settings?.improve_sleep_quality || false}
                onValueChange={handleSleepQualityChange}
                size="sm"
                trackColor={{ 
                  false: theme.colors.background.secondary, 
                  true: theme.colors.primary 
                }}
                isDisabled={isUpdating}
              />
            }
          />

          {/* Sleep Schedule - Only show if Improve Sleep Quality is on */}
          {profile?.settings?.improve_sleep_quality && (
            <>
              <Divider style={styles.divider} />
              <PreferenceRow
                icon="😴"
                label="Sleep Schedule"
                value={formatSleepSchedule()}
                onPress={() => Alert.alert('Sleep Schedule', 'Sleep schedule editing coming soon!')}
              />
            </>
          )}

          <Divider style={styles.divider} />

          {/* Lucid Dreaming Interest */}
          <PreferenceRow
            icon="✨"
            label="Embrace Lucid Dreams"
            rightElement={
              <Switch
                value={profile?.settings?.interested_in_lucid_dreaming || false}
                onValueChange={handleLucidDreamingChange}
                size="sm"
                trackColor={{ 
                  false: theme.colors.background.secondary, 
                  true: theme.colors.primary 
                }}
                isDisabled={isUpdating}
              />
            }
          />
        </VStack>

        {isUpdating && (
          <Text variant="caption" color="secondary" style={styles.updatingText}>
            Updating preferences...
          </Text>
        )}
      </VStack>
    </Card>
  );
};