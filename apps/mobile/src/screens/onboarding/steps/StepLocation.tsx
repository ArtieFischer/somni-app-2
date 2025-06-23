import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Alert, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Country, State, City } from 'country-state-city';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Text, Button } from '../../../components/atoms';

interface StepLocationProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface LocationPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCountry: (country: any) => void;
  onSelectState: (state: any) => void;
  onSelectCity: (city: any) => void;
  selectedCountry?: any;
  selectedState?: any;
  selectedCity?: any;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  isVisible,
  onClose,
  onSelectCountry,
  onSelectState,
  onSelectCity,
  selectedCountry,
  selectedState,
  selectedCity,
}) => {
  const theme = useTheme();
  const [mode, setMode] = useState<'country' | 'state' | 'city'>('country');
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Load countries when modal opens
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
    }
  }, [isVisible]);

  useEffect(() => {
    if (selectedCountry && mode === 'state') {
      setLoading(true);
      // Load states for selected country
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);
      setLoading(false);
    }
  }, [selectedCountry, mode]);

  useEffect(() => {
    if (selectedCountry && selectedState && mode === 'city') {
      setLoading(true);
      // Load cities for selected state
      const stateCities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
      setCities(stateCities);
      setLoading(false);
    }
  }, [selectedCountry, selectedState, mode]);

  const filteredData = () => {
    const query = searchQuery.toLowerCase();
    if (mode === 'country') {
      return countries.filter(c => c.name.toLowerCase().includes(query));
    } else if (mode === 'state') {
      return states.filter(s => s.name.toLowerCase().includes(query));
    } else {
      return cities.filter(c => c.name.toLowerCase().includes(query));
    }
  };

  const handleSelect = (item: any) => {
    if (mode === 'country') {
      onSelectCountry(item);
      setMode('state');
      setSearchQuery('');
    } else if (mode === 'state') {
      onSelectState(item);
      setMode('city');
      setSearchQuery('');
    } else {
      onSelectCity(item);
      onClose();
    }
  };

  const goBack = () => {
    if (mode === 'state') {
      setMode('country');
    } else if (mode === 'city') {
      setMode('state');
    }
    setSearchQuery('');
  };

  const getTitle = () => {
    if (mode === 'country') return 'Select Country';
    if (mode === 'state') return 'Select State/Province';
    return 'Select City';
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
            <View style={{
              backgroundColor: theme.colors.background.elevated,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: '90%',
              paddingBottom: 40,
            }}>
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.medium,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border.primary,
              }}>
                {mode !== 'country' ? (
                  <TouchableOpacity onPress={goBack}>
                    <Text variant="body" style={{ color: theme.colors.primary }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 50 }} />
                )}
                <Text variant="h3">{getTitle()}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text variant="body" style={{ color: theme.colors.text.secondary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={{
                padding: theme.spacing.medium,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border.primary,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: 8,
                  paddingHorizontal: theme.spacing.medium,
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: theme.spacing.small,
                      fontSize: 16,
                      color: theme.colors.text.primary,
                    }}
                    placeholder={`Search ${mode}...`}
                    placeholderTextColor={theme.colors.text.secondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Text variant="body" style={{ color: theme.colors.text.secondary }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* List */}
              {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredData()}
                  keyExtractor={(item) => item.isoCode || item.name}
                  contentContainerStyle={{ paddingBottom: 50 }}
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      style={{
                        paddingVertical: theme.spacing.medium,
                        paddingHorizontal: theme.spacing.large,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border.secondary,
                      }}
                    >
                      <Text variant="body" style={{ color: theme.colors.text.primary }}>
                        {item.name}
                      </Text>
                      {item.stateCode && (
                        <Text variant="caption" style={{ color: theme.colors.text.secondary, marginTop: 2 }}>
                          {item.stateCode}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const StepLocation: React.FC<StepLocationProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const [locationMethod, setLocationMethod] = useState(data.locationMethod || 'skip');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      onUpdate({
        locationMethod: 'auto',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        locationCity: address?.city || '',
        locationCountry: address?.country || '',
        locationDisplay: `${address?.city || ''}, ${address?.country || ''}`,
      });
      
      setLocationMethod('auto');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try manual entry.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleNext = () => {
    if (locationMethod === 'manual' && selectedCountry && selectedCity) {
      onUpdate({
        locationMethod: 'manual',
        locationCountry: selectedCountry.name,
        locationState: selectedState?.name || '',
        locationCity: selectedCity.name,
        locationDisplay: `${selectedCity.name}, ${selectedCountry.name}`,
      });
    } else if (locationMethod === 'skip') {
      onUpdate({
        locationMethod: 'skip',
        location: null,
        locationDisplay: null,
      });
    }
    onNext();
  };

  const getLocationDisplay = () => {
    if (selectedCity && selectedCountry) {
      return `${selectedCity.name}, ${selectedCountry.name}`;
    }
    if (selectedState && selectedCountry) {
      return `${selectedState.name}, ${selectedCountry.name}`;
    }
    if (selectedCountry) {
      return selectedCountry.name;
    }
    return '';
  };

  const styles = {
    container: {
      flex: 1,
      padding: theme.spacing.large,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    optionsContainer: {
      gap: theme.spacing.medium,
    },
    option: {
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.medium,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      marginBottom: theme.spacing.medium,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background.elevated,
    },
    optionText: {
      color: theme.colors.text.primary,
      textAlign: 'center' as const,
    },
    optionTextSelected: {
      color: theme.colors.primary,
    },
    subText: {
      color: theme.colors.text.secondary,
      textAlign: 'center' as const,
      marginTop: theme.spacing.xs,
      fontSize: 14,
    },
    locationDisplay: {
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.medium,
      borderRadius: 8,
      marginTop: theme.spacing.small,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
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
          {t('location.title')}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text.secondary }}>
          {t('location.description')}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={requestLocationPermission}
          style={[
            styles.option,
            locationMethod === 'auto' && styles.optionSelected,
          ]}
          disabled={isLoadingLocation}
        >
          <Text
            variant="body"
            style={[
              styles.optionText,
              locationMethod === 'auto' && styles.optionTextSelected,
            ]}
          >
            {isLoadingLocation ? t('location.gettingLocation') : t('location.useCurrentLocation')}
          </Text>
          {data.locationDisplay && locationMethod === 'auto' && (
            <Text style={styles.subText}>
              {data.locationDisplay}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setLocationMethod('manual');
            setShowLocationPicker(true);
          }}
          style={[
            styles.option,
            locationMethod === 'manual' && styles.optionSelected,
          ]}
        >
          <Text
            variant="body"
            style={[
              styles.optionText,
              locationMethod === 'manual' && styles.optionTextSelected,
            ]}
          >
            {t('location.enterManually')}
          </Text>
        </TouchableOpacity>

        {locationMethod === 'manual' && getLocationDisplay() && (
          <View style={styles.locationDisplay}>
            <Text variant="body" style={{ color: theme.colors.text.primary }}>
              {getLocationDisplay()}
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              style={{ marginTop: theme.spacing.small }}
            >
              <Text variant="caption" style={{ color: theme.colors.primary }}>
                Change location
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setLocationMethod('skip')}
          style={[
            styles.option,
            locationMethod === 'skip' && styles.optionSelected,
          ]}
        >
          <Text
            variant="body"
            style={[
              styles.optionText,
              locationMethod === 'skip' && styles.optionTextSelected,
            ]}
          >
            {t('location.skipForNow')}
          </Text>
        </TouchableOpacity>
      </View>

      <LocationPicker
        isVisible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectCountry={setSelectedCountry}
        onSelectState={setSelectedState}
        onSelectCity={setSelectedCity}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        selectedCity={selectedCity}
      />

      <View style={styles.footer}>
        <Button
          variant="ghost"
          onPress={onPrevious}
          style={{ flex: 1 }}
        >
          {t('common.back')}
        </Button>
        <Button
          onPress={handleNext}
          disabled={locationMethod === 'manual' && (!selectedCountry || !selectedCity)}
          style={{ flex: 1 }}
        >
          {t('common.continue')}
        </Button>
      </View>
    </ScrollView>
  );
};