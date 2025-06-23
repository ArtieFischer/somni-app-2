import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  visible,
  onClose,
  title = 'Select Time',
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const [selectedHour, setSelectedHour] = useState(value.getHours());
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());

  useEffect(() => {
    setSelectedHour(value.getHours());
    setSelectedMinute(value.getMinutes());
  }, [value, visible]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleConfirm = () => {
    const newDate = new Date(value);
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    onChange(newDate);
    onClose();
  };

  const formatHour = (hour: number) => {
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${isPM ? 'PM' : 'AM'}`;
  };

  const formatMinute = (minute: number) => {
    return minute.toString().padStart(2, '0');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.modalSafeArea}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text variant="h3" style={styles.modalTitle}>
                {title}
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </Pressable>
            </View>

            {/* Selected Time Display */}
            <View style={styles.selectedTimeContainer}>
              <Text variant="h1" style={styles.selectedTime}>
                {formatHour(selectedHour)}:{formatMinute(selectedMinute)}
              </Text>
            </View>

            {/* Picker Container */}
            <View style={styles.pickerContainer}>
              {/* Hour Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <Pressable
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {formatHour(hour)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {minutes.map((minute) => (
                    <Pressable
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {formatMinute(minute)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                variant="ghost"
                onPress={onClose}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleConfirm}
                style={styles.button}
              >
                Confirm
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large,
      height: '70%',
      maxHeight: 600,
    },
    modalSafeArea: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.large,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalTitle: {
      flex: 1,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.spacing.small,
    },
    selectedTimeContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.large,
      backgroundColor: theme.colors.background.secondary,
      marginHorizontal: theme.spacing.large,
      marginTop: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
    },
    selectedTime: {
      color: theme.colors.primary,
      fontSize: 32,
      fontWeight: '600' as any,
    },
    pickerContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.large,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: theme.spacing.small,
    },
    pickerLabel: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.medium,
      textTransform: 'uppercase',
      fontWeight: '600' as any,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: theme.spacing.medium,
    },
    pickerItem: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
    },
    pickerItemSelected: {
      backgroundColor: theme.colors.primary,
    },
    pickerItemText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
    },
    pickerItemTextSelected: {
      color: theme.colors.text.primary,
      fontWeight: '600' as any,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.large,
      gap: theme.spacing.medium,
    },
    button: {
      flex: 1,
    },
  });
};