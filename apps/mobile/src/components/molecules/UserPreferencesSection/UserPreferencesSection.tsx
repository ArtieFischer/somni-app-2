import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Text, Card } from '../../atoms';
import { LanguageSelector } from '../LanguageSelector';
import { CountryStateCityPicker } from '../CountryStateCityPicker';
import { 
  Box,
  VStack,
  HStack,
  Heading,
  Divider
} from '@gluestack-ui/themed';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '@somni/stores';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './UserPreferencesSection.styles';
import { LocationAccuracy } from '@somni/types';
import * as Location from 'expo-location';

const userRepository = new UserRepository();

interface UserPreferencesSectionProps {
  onUpdateSuccess?: () => void;
}

export const UserPreferencesSection: React.FC<UserPreferencesSectionProps> = ({ onUpdateSuccess }) => {
  const { user, profile } = useAuth();
  const { setProfile } = useAuthStore();
  const theme = useTheme();
  const styles = useStyles();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    country?: { name: string; code: string };
    state?: { name: string; code: string };
    city?: { name: string };
  }>({});
  
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

  const handleDisplayNameChange = async () => {
    if (!user?.id || !newDisplayName.trim()) return;

    setIsUpdating(true);
    try {
      const updatedProfile = await userRepository.update(user.id, {
        username: newDisplayName.trim()
      });

      setProfile(updatedProfile);
      onUpdateSuccess?.();
      setShowDisplayNameModal(false);
      Alert.alert('Success', 'Display name updated successfully');
    } catch (error) {
      console.error('Display name update error:', error);
      Alert.alert('Error', 'Failed to update display name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLocationSharingChange = async (accuracy: LocationAccuracy) => {
    if (!user?.id) return;

    if (accuracy === 'exact') {
      // Request GPS permissions and get location
      await handleExactLocationSharing();
    } else if (accuracy === 'manual') {
      // Open manual location picker
      setShowLocationModal(true);
    } else {
      // Set to none - no location sharing
      await updateLocationAccuracy(accuracy, {});
    }
  };

  const handleExactLocationSharing = async () => {
    try {
      setIsUpdating(true);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to share your precise location.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get location details
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        country: address.country || '',
        city: address.city || address.subAdministrativeArea || '',
      };

      await updateLocationAccuracy('exact', locationData);
    } catch (error) {
      console.error('GPS location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again or select manually.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualLocationSelect = async (locationData: {
    country?: { name: string; code: string };
    state?: { name: string; code: string };
    city?: { name: string };
  }) => {
    setSelectedLocation(locationData);
    
    const updateData = {
      country: locationData.country?.name || '',
      city: [locationData.city?.name, locationData.state?.name]
        .filter(Boolean)
        .join(', ') || '',
    };

    await updateLocationAccuracy('manual', updateData);
    setShowLocationModal(false);
  };

  const updateLocationAccuracy = async (accuracy: LocationAccuracy, locationData: any) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const newSettings = {
        ...profile?.settings,
        location_sharing: accuracy
      };

      const updateFields: any = {
        settings: newSettings,
        location_accuracy: accuracy
      };

      if (accuracy === 'exact' && locationData.lat && locationData.lng) {
        updateFields.location = { lat: locationData.lat, lng: locationData.lng };
        updateFields.location_country = locationData.country;
        updateFields.location_city = locationData.city;
      } else if (accuracy === 'manual') {
        updateFields.location_country = locationData.country;
        updateFields.location_city = locationData.city;
        updateFields.location = null; // Clear GPS coordinates for manual
      } else {
        // Clear all location data for 'none'
        updateFields.location = null;
        updateFields.location_country = null;
        updateFields.location_city = null;
      }

      const updatedProfile = await userRepository.update(user.id, updateFields);

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

  const getLocationSharingText = (accuracy?: LocationAccuracy) => {
    const texts = {
      none: 'Not sharing',
      manual: 'Manually set',
      exact: 'GPS location'
    };
    return texts[accuracy || 'none'];
  };

  const getLocationDisplayText = () => {
    if (profile?.location_accuracy === 'exact' && profile?.location_city && profile?.location_country) {
      return `GPS: ${profile.location_city}, ${profile.location_country}`;
    } else if (profile?.location_accuracy === 'manual' && profile?.location_city && profile?.location_country) {
      return `Manual: ${profile.location_city}, ${profile.location_country}`;
    } else {
      return getLocationSharingText(profile?.location_accuracy);
    }
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
          User Preferences
        </Heading>

        <VStack space="xs">
          {/* Display Name */}
          <PreferenceRow
            icon="👤"
            label="Display Name"
            value={profile?.username || 'Not set'}
            onPress={() => {
              setNewDisplayName(profile?.username || '');
              setShowDisplayNameModal(true);
            }}
          />
          
          <Divider style={styles.divider} />

          {/* Language */}
          <PreferenceRow
            icon="🌐"
            label="Language"
            value={profile?.locale === 'pl' ? 'Polski' : 'English'}
            onPress={() => setShowLanguageModal(true)}
          />

          <Divider style={styles.divider} />

          {/* Location Sharing */}
          <PreferenceRow
            icon="📍"
            label="Location Sharing"
            value={getLocationDisplayText()}
            onPress={() => {
              Alert.alert(
                'Location Sharing',
                'Choose your location sharing preference',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Don\'t share', onPress: () => handleLocationSharingChange('none') },
                  { text: 'Manual selection', onPress: () => handleLocationSharingChange('manual') },
                  { text: 'GPS location', onPress: () => handleLocationSharingChange('exact') }
                ]
              );
            }}
          />

          <Divider style={styles.divider} />

          {/* Email */}
          <PreferenceRow
            icon="✉️"
            label="Email"
            value={user?.email}
          />

          <Divider style={styles.divider} />

          {/* Privacy Settings */}
          <PreferenceRow
            icon="🔒"
            label="Privacy Settings"
            onPress={() => Alert.alert('Privacy Settings', 'Privacy settings coming soon!')}
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

      {/* Display Name Modal */}
      <Modal
        visible={showDisplayNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisplayNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Change Display Name</Text>
              <TouchableOpacity onPress={() => setShowDisplayNameModal(false)}>
                <Text variant="h2" style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            
            <VStack space="md" style={{ padding: theme.spacing.medium }}>
              <TextInput
                style={styles.input}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={theme.colors.text.secondary}
                autoFocus
                maxLength={50}
              />
              
              <HStack space="md" justifyContent="flex-end">
                <TouchableOpacity onPress={() => setShowDisplayNameModal(false)}>
                  <Text variant="body" color="secondary">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleDisplayNameChange}
                  disabled={!newDisplayName.trim() || isUpdating}
                >
                  <Text variant="body" color="primary">Save</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </View>
        </View>
      </Modal>

      {/* Manual Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Select Your Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text variant="h2" style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ padding: theme.spacing.medium }}>
              <CountryStateCityPicker
                onSelect={handleManualLocationSelect}
              />
            </View>
            
            <View style={{ padding: theme.spacing.medium }}>
              <TouchableOpacity 
                onPress={() => setShowLocationModal(false)}
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  padding: theme.spacing.medium,
                  borderRadius: theme.borderRadius.medium,
                  alignItems: 'center'
                }}
              >
                <Text variant="body" color="secondary">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
};