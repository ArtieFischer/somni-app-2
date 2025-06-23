import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Text, Button } from '../../../components/atoms';

interface StepSleepScheduleProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface TimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (hour: number, minute: number) => void;
  initialHour?: number;
  initialMinute?: number;
  label: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  isVisible,
  onClose,
  onSelect,
  initialHour = 0,
  initialMinute = 0,
  label,
}) => {
  const theme = useTheme();
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);

  // Generate all 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minutes in 5-minute intervals
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0');
  };

  const formatMinute = (minute: number) => minute.toString().padStart(2, '0');

  const handleConfirm = () => {
    onSelect(selectedHour, selectedMinute);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: theme.colors.background.elevated,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 40,
                maxHeight: '80%',
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing.medium,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border.primary,
                }}
              >
                <TouchableOpacity onPress={onClose}>
                  <Text
                    variant="body"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text variant="h3">{label}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text
                    variant="body"
                    style={{ color: theme.colors.primary, fontWeight: '600' }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Display */}
              <View
                style={{
                  padding: theme.spacing.large,
                  alignItems: 'center',
                }}
              >
                <Text variant="h1" style={{ fontSize: 48, lineHeight: 56, includeFontPadding: false }}>
                  {formatHour(selectedHour)}:{formatMinute(selectedMinute)}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  24-hour format
                </Text>
              </View>

              {/* Pickers */}
              <View
                style={{
                  flexDirection: 'row',
                  height: 200,
                  paddingHorizontal: theme.spacing.medium,
                  gap: theme.spacing.small,
                }}
              >
                {/* Hour Picker */}
                <View style={{ flex: 1 }}>
                  <Text
                    variant="caption"
                    style={{
                      textAlign: 'center',
                      marginBottom: theme.spacing.small,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Hour
                  </Text>
                  <FlatList
                    data={hours}
                    keyExtractor={(item) => item.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 40 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedHour(item)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          marginHorizontal: 10,
                          backgroundColor:
                            selectedHour === item
                              ? theme.colors.primary + '20'
                              : 'transparent',
                          borderRadius: 8,
                          marginVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            color:
                              selectedHour === item
                                ? theme.colors.primary
                                : theme.colors.text.primary,
                            fontWeight: selectedHour === item ? '600' : '400',
                            fontSize: 20,
                            lineHeight: 28,
                            includeFontPadding: false,
                          }}
                        >
                          {formatHour(item)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* Separator */}
                <View
                  style={{
                    width: 1,
                    backgroundColor: theme.colors.border.secondary,
                    marginVertical: 20,
                  }}
                />

                {/* Minute Picker */}
                <View style={{ flex: 1 }}>
                  <Text
                    variant="caption"
                    style={{
                      textAlign: 'center',
                      marginBottom: theme.spacing.small,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Minute
                  </Text>
                  <FlatList
                    data={minutes}
                    keyExtractor={(item) => item.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 40 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedMinute(item)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          marginHorizontal: 10,
                          backgroundColor:
                            selectedMinute === item
                              ? theme.colors.primary + '20'
                              : 'transparent',
                          borderRadius: 8,
                          marginVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            color:
                              selectedMinute === item
                                ? theme.colors.primary
                                : theme.colors.text.primary,
                            fontWeight: selectedMinute === item ? '600' : '400',
                            fontSize: 20,
                            lineHeight: 28,
                            includeFontPadding: false,
                          }}
                        >
                          {formatMinute(item)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const StepSleepSchedule: React.FC<StepSleepScheduleProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');

  // Initialize with sensible defaults
  const getTimeFromString = (timeString?: string) => {
    if (!timeString) return { hour: 22, minute: 0 }; // Default 10 PM
    const date = new Date(timeString);
    return { hour: date.getHours(), minute: date.getMinutes() };
  };

  const bedTimeData = getTimeFromString(data.bedTime);
  const wakeTimeData = getTimeFromString(data.wakeTime);

  const [bedTime, setBedTime] = useState({
    hour: bedTimeData.hour,
    minute: bedTimeData.minute,
  });
  const [wakeTime, setWakeTime] = useState({
    hour: wakeTimeData.hour || 7,
    minute: wakeTimeData.minute,
  });
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const formatDisplayTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    const bedTimeDate = new Date();
    bedTimeDate.setHours(bedTime.hour, bedTime.minute, 0, 0);

    const wakeTimeDate = new Date();
    wakeTimeDate.setHours(wakeTime.hour, wakeTime.minute, 0, 0);

    onUpdate({
      bedTime: bedTimeDate.toISOString(),
      wakeTime: wakeTimeDate.toISOString(),
    });
    onNext();
  };

  const styles = {
    container: {
      flex: 1,
      padding: theme.spacing.large,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    timeSection: {
      marginBottom: theme.spacing.xl,
    },
    timeButton: {
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.large,
      borderRadius: 12,
      marginTop: theme.spacing.small,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 80,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    timeText: {
      fontSize: 32,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      lineHeight: 40,
      includeFontPadding: false,
    },
    timePeriod: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    footer: {
      marginTop: 'auto' as const,
      paddingTop: theme.spacing.xl,
      flexDirection: 'row' as const,
      gap: theme.spacing.medium,
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
          {String(t('sleepSchedule.title'))}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text.secondary }}>
          {String(t('sleepSchedule.description'))}
        </Text>
      </View>

      <View style={styles.timeSection}>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {String(t('sleepSchedule.bedtimeLabel'))}
        </Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowBedTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {formatDisplayTime(bedTime.hour, bedTime.minute)}
          </Text>
          <Text style={styles.timePeriod}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeSection}>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {String(t('sleepSchedule.wakeTimeLabel'))}
        </Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowWakeTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {formatDisplayTime(wakeTime.hour, wakeTime.minute)}
          </Text>
          <Text style={styles.timePeriod}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      <TimePicker
        isVisible={showBedTimePicker}
        onClose={() => setShowBedTimePicker(false)}
        onSelect={(hour, minute) => setBedTime({ hour, minute })}
        initialHour={bedTime.hour}
        initialMinute={bedTime.minute}
        label="Select Bedtime"
      />

      <TimePicker
        isVisible={showWakeTimePicker}
        onClose={() => setShowWakeTimePicker(false)}
        onSelect={(hour, minute) => setWakeTime({ hour, minute })}
        initialHour={wakeTime.hour}
        initialMinute={wakeTime.minute}
        label="Select Wake Time"
      />

      <View style={styles.footer}>
        <Button variant="secondary" onPress={onPrevious} style={{ flex: 1 }}>
          {String(t('common.back'))}
        </Button>
        <Button onPress={handleNext} style={{ flex: 1 }}>
          {String(t('common.continue'))}
        </Button>
      </View>
    </ScrollView>
  );
};
