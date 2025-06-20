import React, { useState } from 'react';
import { View, ViewStyle, TouchableOpacity, Image, Alert, Platform, ScrollView, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Text, Button, Input, RadioButton } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import type { OnboardingData } from '../OnboardingScreen';

const PersonalInfoSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name is too long'),
  sex: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  date_of_birth: z.string(),
  language: z.literal('en'),
});

type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

interface StepPersonalInfoProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    data.date_of_birth ? new Date(data.date_of_birth) : new Date(2000, 0, 1)
  );
  const [avatarUri, setAvatarUri] = useState<string | undefined>(data.avatar_url);
  const [avatarFile, setAvatarFile] = useState<any>(data.avatarFile);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      display_name: data.display_name || '',
      sex: data.sex || undefined,
      date_of_birth: data.date_of_birth || '',
      language: 'en',
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to set your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarFile(result.assets[0]);
    }
  };

  const onSubmit = (formData: PersonalInfoData) => {
    // Check age (must be 13+)
    const birthDate = new Date(formData.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      Alert.alert('Age Requirement', 'You must be at least 13 years old to use this app.');
      return;
    }

    onUpdate({
      ...formData,
      avatarFile,
      avatar_url: avatarUri,
    });
    onNext();
  };

  const sexOptions = [
    { value: 'male', label: String(t('personalInfo.sexOptions.male')) + ' ♂️' },
    { value: 'female', label: String(t('personalInfo.sexOptions.female')) + ' ♀️' },
    { value: 'other', label: String(t('personalInfo.sexOptions.other')) + ' ⚧' },
    { value: 'prefer_not_to_say', label: String(t('personalInfo.sexOptions.preferNotToSay')) + ' 🤐' },
  ];

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.medium,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    avatarButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.accent.primary,
      borderStyle: 'dashed',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    sexContainer: {
      gap: theme.spacing.small,
    },
    sexOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.background.secondary,
    },
    sexOptionSelected: {
      borderColor: theme.colors.accent.primary,
      backgroundColor: theme.colors.accent.primary + '10',
    },
    dateButton: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.elevated,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      marginTop: theme.spacing.xl,
    },
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
        {String(t('personalInfo.title'))}
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.xl }}>
        {String(t('personalInfo.subtitle'))}
      </Text>

      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Text variant="h1">📷</Text>
          )}
        </TouchableOpacity>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.small }}>
          {String(t('personalInfo.avatarHint'))}
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="display_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('personalInfo.displayName'))}
              placeholder={String(t('personalInfo.displayNamePlaceholder'))}
              value={value}
              onChangeText={onChange}
              error={errors.display_name?.message}
            />
          )}
        />

        <View>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {String(t('personalInfo.sex'))}
          </Text>
          <Controller
            control={control}
            name="sex"
            render={({ field: { onChange, value } }) => (
              <RadioButton
                options={sexOptions}
                value={value}
                onChange={onChange}
              />
            )}
          />
          {errors.sex && (
            <Text variant="caption" color="error" style={{ marginTop: theme.spacing.xs }}>
              {errors.sex.message}
            </Text>
          )}
        </View>

        <View>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {String(t('personalInfo.dateOfBirth'))}
          </Text>
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text variant="body">
                    {value || String(t('personalInfo.selectDate'))}
                  </Text>
                </TouchableOpacity>
                
                {/* Android Date Picker */}
                {showDatePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date && event.type === 'set') {
                        setSelectedDate(date);
                        onChange(date.toISOString().split('T')[0]);
                      }
                    }}
                    maximumDate={new Date()}
                    themeVariant="dark"
                  />
                )}
                
                {/* iOS Date Picker in Modal */}
                {showDatePicker && Platform.OS === 'ios' && (
                  <Modal
                    transparent
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'flex-end',
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                      <View style={{
                        backgroundColor: theme.colors.background.elevated,
                        borderTopLeftRadius: theme.borderRadius.large,
                        borderTopRightRadius: theme.borderRadius.large,
                        paddingBottom: 20,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingHorizontal: theme.spacing.medium,
                          paddingVertical: theme.spacing.small,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border.primary,
                        }}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text variant="body" color="secondary">Cancel</Text>
                          </TouchableOpacity>
                          <Text variant="subtitle">Select Date</Text>
                          <TouchableOpacity onPress={() => {
                            onChange(selectedDate.toISOString().split('T')[0]);
                            setShowDatePicker(false);
                          }}>
                            <Text variant="body" color="primary">Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          onChange={(event, date) => {
                            if (date) {
                              setSelectedDate(date);
                            }
                          }}
                          maximumDate={new Date()}
                          themeVariant="dark"
                        />
                      </View>
                    </View>
                  </Modal>
                )}
              </>
            )}
          />
          {errors.date_of_birth && (
            <Text variant="caption" color="error" style={{ marginTop: theme.spacing.xs }}>
              {errors.date_of_birth.message}
            </Text>
          )}
        </View>

        <View>
          <Text variant="label" style={{ marginBottom: theme.spacing.small }}>
            {String(t('personalInfo.language'))}
          </Text>
          <View style={styles.dateButton}>
            <Text variant="body">English</Text>
          </View>
          <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
            {String(t('personalInfo.languageNote'))}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          action="secondary"
          onPress={onPrevious}
          style={{ flex: 1 }}
        >
          {String(t('personalInfo.back'))}
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          style={{ flex: 1 }}
        >
          {String(t('personalInfo.continue'))}
        </Button>
      </View>
    </ScrollView>
  );
};