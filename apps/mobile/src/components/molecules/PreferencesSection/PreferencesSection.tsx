import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text, Button } from '../../atoms';
import { LanguageSelector } from '../LanguageSelector';
import { 
  Box,
  VStack,
  HStack,
  Heading,
  Switch,
  Divider,
  Badge,
  BadgeText,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  ChevronDownIcon
} from '@gluestack-ui/themed';
import { useAuth } from '../../../hooks/useAuth';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './PreferencesSection.styles';
import { UserProfile, LocationAccuracy } from '@somni/types';

const userRepository = new UserRepository();

interface PreferencesSectionProps {
  onUpdateSuccess?: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ onUpdateSuccess }) => {
  const { user, profile, setProfile } = useAuth();
  const theme = useTheme();
  const styles = useStyles();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleLanguageChange = async (newLanguage: string) => {
    if (!user?.id || newLanguage === profile?.locale) {
      setShowLanguageModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedProfile = await userRepository.update(user.id, {
        locale: newLanguage
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      Alert.alert('Success', 'Language preference updated successfully');
    } catch (error) {
      console.error('Language update error:', error);
      Alert.alert('Error', 'Failed to update language preference. Please try again.');
    } finally {
      setIsUpdating(false);
      setShowLanguageModal(false);
    }
  };

  const handleInterpreterChange = async (interpreterId: string) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const updatedProfile = await userRepository.update(user.id, {
        dream_interpreter: interpreterId as 'carl' | 'sigmund' | 'lakshmi' | 'mary'
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      Alert.alert('Success', 'Dream interpreter updated successfully');
    } catch (error) {
      console.error('Interpreter update error:', error);
      Alert.alert('Error', 'Failed to update dream interpreter. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLocationSharingChange = async (accuracy: LocationAccuracy) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const newSettings = {
        ...profile?.settings,
        location_sharing: accuracy
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings,
        location_accuracy: accuracy
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      Alert.alert('Success', 'Location sharing preference updated');
    } catch (error) {
      console.error('Location sharing update error:', error);
      Alert.alert('Error', 'Failed to update location sharing preference.');
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

  const getLocationSharingText = (accuracy?: LocationAccuracy) => {
    const texts = {
      none: 'Not sharing',
      country: 'Country only',
      region: 'Region only', 
      city: 'City only',
      exact: 'Precise location'
    };
    return texts[accuracy || 'none'];
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
    <Box style={styles.container}>
      <VStack space="md">
        <Heading size="md" style={styles.sectionTitle}>
          Preferences
        </Heading>

        <VStack space="xs">
          {/* Language */}
          <PreferenceRow
            icon="🌐"
            label="Language"
            value={profile?.locale === 'pl' ? 'Polski' : 'English'}
            onPress={() => setShowLanguageModal(true)}
          />
          
          <Divider style={styles.divider} />

          {/* Dream Interpreter */}
          <PreferenceRow
            icon="🧙‍♂️"
            label="Dream Interpreter"
            value={getInterpreterName(profile?.dream_interpreter)}
            onPress={() => {
              Alert.alert(
                'Select Dream Interpreter',
                'Choose your preferred dream interpreter',
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

          {/* Sleep Schedule */}
          <PreferenceRow
            icon="😴"
            label="Sleep Schedule"
            value={formatSleepSchedule()}
            onPress={() => Alert.alert('Sleep Schedule', 'Sleep schedule editing coming soon!')}
          />

          <Divider style={styles.divider} />

          {/* Location Sharing */}
          <PreferenceRow
            icon="📍"
            label="Location Sharing"
            value={getLocationSharingText(profile?.location_accuracy)}
            onPress={() => {
              Alert.alert(
                'Location Sharing',
                'Choose your location sharing preference',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Don\'t share', onPress: () => handleLocationSharingChange('none') },
                  { text: 'Country only', onPress: () => handleLocationSharingChange('country') },
                  { text: 'City only', onPress: () => handleLocationSharingChange('city') },
                  { text: 'Precise location', onPress: () => handleLocationSharingChange('exact') }
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

          <Divider style={styles.divider} />

          {/* Lucid Dreaming Interest */}
          <PreferenceRow
            icon="✨"
            label="Interested in Lucid Dreaming"
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

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text variant="h2" style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            
            <LanguageSelector
              currentLanguage={profile?.locale || 'en'}
              onLanguageChange={handleLanguageChange}
              label=""
              limitedLanguages={['en', 'pl']}
            />
          </View>
        </View>
      </Modal>
    </Box>
  );
};