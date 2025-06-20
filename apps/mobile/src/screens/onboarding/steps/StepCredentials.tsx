import React, { useState } from 'react';
import { View, ViewStyle, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, Button, Input } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { supabase } from '../../../lib/supabase';
import type { OnboardingData } from '../OnboardingScreen';

const CredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be at most 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type CredentialsData = z.infer<typeof CredentialsSchema>;

interface StepCredentialsProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  navigation?: any;
}

export const StepCredentials: React.FC<StepCredentialsProps> = ({
  data,
  onUpdate,
  onNext,
  navigation,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CredentialsData>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: {
      email: data.email || '',
      password: data.password || '',
      username: data.username || '',
    },
  });

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('id')
        .eq('username', username)
        .single();

      return !data; // Username is available if no data is returned
    } catch {
      return true; // Assume available on error (likely no match found)
    }
  };

  const onSubmit = async (formData: CredentialsData) => {
    setIsCheckingUsername(true);
    
    // Check username availability
    const isAvailable = await checkUsernameAvailability(formData.username);
    
    if (!isAvailable) {
      setError('username', {
        type: 'manual',
        message: 'This username is already taken',
      });
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(false);
    onUpdate(formData);
    onNext();
  };

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.xl,
    },
    form: {
      gap: theme.spacing.medium,
    },
    buttonContainer: {
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
        {String(t('credentials.title'))}
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.xl }}>
        {String(t('credentials.subtitle'))}
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('credentials.email'))}
              placeholder="you@example.com"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('credentials.password'))}
              placeholder="Minimum 8 characters"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              type="password"
            />
          )}
        />

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={String(t('credentials.username'))}
              placeholder="Choose a unique handle"
              value={value}
              onChangeText={(text) => onChange(text.toLowerCase())}
              error={errors.username?.message}
              autoCapitalize="none"
              helperText={String(t('credentials.usernameHelper'))}
            />
          )}
        />
      </View>

      <View style={[styles.buttonContainer, { flexDirection: 'row', gap: theme.spacing.medium }]}>
        {navigation && (
          <Button
            variant="outline"
            action="secondary"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          >
            Back
          </Button>
        )}
        <Button
          onPress={handleSubmit(onSubmit)}
          isLoading={isCheckingUsername}
          style={{ flex: navigation ? 1 : undefined }}
        >
          {String(t('credentials.continue'))}
        </Button>
      </View>
    </ScrollView>
  );
};