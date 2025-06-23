import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { Text, Button, Card } from '../../atoms';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Switch,
  Divider,
  Button as GluestackButton,
  ButtonText,
} from '@gluestack-ui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '@somni/stores';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './DreamingPreferencesSection.styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileIcons } from '../../../constants/profileIcons';

const userRepository = new UserRepository();

interface DreamingPreferencesSectionProps {
  onUpdateSuccess?: () => void;
}

export const DreamingPreferencesSection: React.FC<
  DreamingPreferencesSectionProps
> = ({ onUpdateSuccess }) => {
  const { user, profile } = useAuth();
  const { setProfile } = useAuthStore();
  const theme = useTheme();
  const styles = useStyles();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSleepScheduleModal, setShowSleepScheduleModal] = useState(false);
  const [editingTime, setEditingTime] = useState<'bed' | 'wake' | null>(null);
  const [tempBedTime, setTempBedTime] = useState(new Date());
  const [tempWakeTime, setTempWakeTime] = useState(new Date());

  const handleInterpreterChange = async (interpreterId: string) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const updatedProfile = await userRepository.update(user.id, {
        dream_interpreter: interpreterId as
          | 'carl'
          | 'sigmund'
          | 'lakshmi'
          | 'mary',
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
        improve_sleep_quality: value,
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings,
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
        interested_in_lucid_dreaming: value,
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings,
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
    return `${formatDisplayTime(schedule.bed)} - ${formatDisplayTime(schedule.wake)}`;
  };

  const formatDisplayTime = (time24: string) => {
    if (!time24) return '';
    return time24; // Return 24-hour format as-is
  };

  const parseTimeToDate = (time24: string) => {
    if (!time24 || !time24.includes(':')) {
      // Return default if invalid
      const date = new Date();
      date.setHours(22, 0, 0, 0); // Default to 10 PM
      return date;
    }
    const [hours, minutes] = time24.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      // Return default if parsing fails
      const date = new Date();
      date.setHours(22, 0, 0, 0);
      return date;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const format24HourTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const openSleepScheduleEditor = () => {
    // Initialize times from current schedule or defaults
    const schedule = profile?.settings?.sleep_schedule;
    if (schedule?.bed && schedule?.wake) {
      setTempBedTime(parseTimeToDate(schedule.bed));
      setTempWakeTime(parseTimeToDate(schedule.wake));
    } else {
      // Default: 10:00 PM bedtime, 6:00 AM wake time
      const bedDefault = new Date();
      bedDefault.setHours(22, 0, 0, 0);
      setTempBedTime(bedDefault);

      const wakeDefault = new Date();
      wakeDefault.setHours(6, 0, 0, 0);
      setTempWakeTime(wakeDefault);
    }
    setShowSleepScheduleModal(true);
  };

  const handleSaveSleepSchedule = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const currentSettings = profile?.settings || {};
      const newSettings = {
        ...currentSettings,
        sleep_schedule: {
          bed: format24HourTime(tempBedTime),
          wake: format24HourTime(tempWakeTime),
        },
      };

      const updatedProfile = await userRepository.update(user.id, {
        settings: newSettings,
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      setShowSleepScheduleModal(false);
      Alert.alert('Success', 'Sleep schedule updated successfully');
    } catch (error) {
      console.error('Sleep schedule update error:', error);
      Alert.alert('Error', 'Failed to update sleep schedule.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getInterpreterName = (id?: string) => {
    const interpreters = {
      carl: 'Carl Jung',
      sigmund: 'Sigmund Freud',
      lakshmi: 'Lakshmi Devi',
      mary: 'Mary Whiton',
    };
    return interpreters[id as keyof typeof interpreters] || 'None selected';
  };

  const PreferenceRow = ({
    iconKey,
    label,
    value,
    onPress,
    rightElement,
  }: {
    iconKey: keyof typeof ProfileIcons;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => {
    const iconConfig = ProfileIcons[iconKey];
    const IconComponent = iconConfig.family;
    
    return (
    <TouchableOpacity
      style={styles.preferenceRow}
      onPress={onPress}
      disabled={!onPress || isUpdating}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <HStack justifyContent="space-between" alignItems="center" flex={1}>
        <HStack space="md" alignItems="center" flex={1}>
          <IconComponent 
            name={iconConfig.name as any} 
            size={24} 
            color={theme.colors.text.secondary}
          />
          <VStack flex={1}>
            <Text variant="body" style={styles.preferenceLabel}>
              {label}
            </Text>
            {value && (
              <Text
                variant="caption"
                color="secondary"
                style={styles.preferenceValue}
              >
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
  };

  return (
    <Card>
      <VStack space="md">
        <Heading size="md" style={styles.sectionTitle}>
          Dreaming Preferences
        </Heading>

        <VStack space="xs">
          {/* Dream Guide (previously Interpreter) */}
          <PreferenceRow
            iconKey="dreamGuide"
            label="Dream Guide"
            value={getInterpreterName(profile?.dream_interpreter)}
            onPress={() => {
              Alert.alert(
                'Select Dream Guide',
                'Choose your preferred dream guide',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Carl Jung',
                    onPress: () => handleInterpreterChange('carl'),
                  },
                  {
                    text: 'Sigmund Freud',
                    onPress: () => handleInterpreterChange('sigmund'),
                  },
                  {
                    text: 'Lakshmi Devi',
                    onPress: () => handleInterpreterChange('lakshmi'),
                  },
                  {
                    text: 'Mary Whiton',
                    onPress: () => handleInterpreterChange('mary'),
                  },
                ],
              );
            }}
          />

          <Divider style={styles.divider} />

          {/* Sleep Quality Interest */}
          <PreferenceRow
            iconKey="sleepQuality"
            label="Improve Sleep Quality"
            rightElement={
              <Switch
                value={profile?.settings?.improve_sleep_quality || false}
                onValueChange={handleSleepQualityChange}
                size="sm"
                trackColor={{
                  false: theme.colors.background.secondary,
                  true: theme.colors.primary,
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
                iconKey="sleepSchedule"
                label="Sleep Schedule"
                value={formatSleepSchedule()}
                onPress={openSleepScheduleEditor}
              />
            </>
          )}

          <Divider style={styles.divider} />

          {/* Lucid Dreaming Interest */}
          <PreferenceRow
            iconKey="lucidDreaming"
            label="Embrace Lucid Dreams"
            rightElement={
              <Switch
                value={profile?.settings?.interested_in_lucid_dreaming || false}
                onValueChange={handleLucidDreamingChange}
                size="sm"
                trackColor={{
                  false: theme.colors.background.secondary,
                  true: theme.colors.primary,
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

      {/* Sleep Schedule Modal */}
      <Modal
        visible={showSleepScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSleepScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Edit Sleep Schedule</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSleepScheduleModal(false);
                  setEditingTime(null);
                }}
              >
                <Text variant="h2" style={styles.modalClose}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <VStack space="lg" style={{ padding: theme.spacing.large }}>
              {/* Helper Text */}
              <Text
                variant="caption"
                color="secondary"
                style={{ textAlign: 'center' }}
              >
                Tap on the time to edit
              </Text>

              {/* Bedtime Selection */}
              <VStack space="sm">
                <Text variant="body" style={styles.timeLabel}>
                  Bedtime
                </Text>
                <TouchableOpacity
                  style={[
                    styles.timeSelector,
                    editingTime === 'bed' && styles.timeSelectorActive,
                  ]}
                  onPress={() =>
                    setEditingTime(editingTime === 'bed' ? null : 'bed')
                  }
                >
                  <Text variant="h2" style={styles.timeText}>
                    {formatDisplayTime(format24HourTime(tempBedTime))}
                  </Text>
                </TouchableOpacity>
              </VStack>

              {/* Wake Time Selection */}
              <VStack space="sm">
                <Text variant="body" style={styles.timeLabel}>
                  Wake Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.timeSelector,
                    editingTime === 'wake' && styles.timeSelectorActive,
                  ]}
                  onPress={() =>
                    setEditingTime(editingTime === 'wake' ? null : 'wake')
                  }
                >
                  <Text variant="h2" style={styles.timeText}>
                    {formatDisplayTime(format24HourTime(tempWakeTime))}
                  </Text>
                </TouchableOpacity>
              </VStack>

              {/* Time Picker */}
              {editingTime && Platform.OS === 'ios' && (
                <DateTimePicker
                  value={editingTime === 'bed' ? tempBedTime : tempWakeTime}
                  mode="time"
                  display="spinner"
                  locale="en_GB"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (editingTime === 'bed') {
                        setTempBedTime(selectedDate);
                      } else {
                        setTempWakeTime(selectedDate);
                      }
                    }
                  }}
                />
              )}

              {/* Android Time Picker (shows as dialog) */}
              {editingTime && Platform.OS === 'android' && (
                <DateTimePicker
                  value={editingTime === 'bed' ? tempBedTime : tempWakeTime}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(event, selectedDate) => {
                    setEditingTime(null);
                    if (selectedDate) {
                      if (editingTime === 'bed') {
                        setTempBedTime(selectedDate);
                      } else {
                        setTempWakeTime(selectedDate);
                      }
                    }
                  }}
                />
              )}

              {/* Action Buttons */}
              <HStack space="md" style={{ marginTop: theme.spacing.medium }}>
                <GluestackButton
                  size="md"
                  variant="outline"
                  action="secondary"
                  onPress={() => {
                    setShowSleepScheduleModal(false);
                    setEditingTime(null);
                  }}
                  style={{ flex: 1 }}
                >
                  <ButtonText>Cancel</ButtonText>
                </GluestackButton>

                <GluestackButton
                  size="md"
                  variant="solid"
                  action="primary"
                  onPress={handleSaveSleepSchedule}
                  isDisabled={isUpdating}
                  style={{ flex: 1 }}
                >
                  <ButtonText>{isUpdating ? 'Saving...' : 'Save'}</ButtonText>
                </GluestackButton>
              </HStack>
            </VStack>
          </View>
        </View>
      </Modal>
    </Card>
  );
};
