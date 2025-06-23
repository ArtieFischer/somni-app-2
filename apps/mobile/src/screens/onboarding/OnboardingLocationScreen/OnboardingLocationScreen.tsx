import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { Button } from '../../../components/atoms/Button';
import { Text } from '../../../components/atoms/Text';
import { useOnboardingStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Theme } from '@somni/theme';
import { LocationAccuracy } from '@somni/types';
import { CountryStateCityPicker } from '../../../components/molecules';
import Ionicons from '@expo/vector-icons/Ionicons';

type LocationMode = 'none' | 'selecting' | 'manual' | 'automatic';

export const OnboardingLocationScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const styles = useStyles(theme);
  const { updateData } = useOnboardingStore();

  const [locationMode, setLocationMode] = useState<LocationMode>('none');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleShareLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          String(t('location.locationPermission.title')),
          String(t('location.locationPermission.message')),
          [{ text: 'OK', onPress: () => setIsLoadingLocation(false) }],
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoordinates({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      // Get location details (country, city)
      const [reverseGeocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode) {
        setSelectedCountry(reverseGeocode.country || '');
        setSelectedState(reverseGeocode.region || '');
        setSelectedCity(reverseGeocode.city || '');
      }

      setLocationMode('automatic');
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLoadingLocation(false);
      Alert.alert(
        'Location Error',
        'Could not get your location. Please try manual entry.',
        [{ text: 'OK', onPress: () => handleSetManually() }],
      );
    }
  };

  const handleSetManually = () => {
    setLocationMode('manual');
  };

  const handleDontShare = () => {
    // Clear any existing location data
    setCoordinates(null);
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    // Update data immediately to save the choice
    updateData({
      locationAccuracy: 'none',
      location: undefined,
      locationCountry: undefined,
      locationCity: undefined,
    });
    // Navigate to next screen
    navigation.navigate('OnboardingCompleteScreen');
  };

  const handleNext = () => {
    let locationAccuracy: LocationAccuracy = 'none';
    let locationData: any = {};

    if (locationMode === 'automatic' && coordinates) {
      locationAccuracy = 'exact';
      locationData = {
        location: coordinates,
        locationCountry: selectedCountry,
        locationCity: selectedCity,
      };
    } else if (locationMode === 'manual' && selectedCountry) {
      locationAccuracy = selectedCity ? 'city' : 'country';
      locationData = {
        locationCountry: selectedCountry,
        locationCity: selectedCity || undefined,
      };
    }

    updateData({
      locationAccuracy,
      ...locationData,
    });

    navigation.navigate('OnboardingCompleteScreen');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isNextDisabled =
    locationMode === 'selecting' ||
    (locationMode === 'manual' && !selectedCountry) ||
    isLoadingLocation;

  return (
    <OnboardingScreenLayout
      title={String(t('location.title'))}
      description={String(t('location.description'))}
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={isNextDisabled}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {locationMode === 'none' && (
          <View style={styles.buttonsContainer}>
            <Button
              onPress={handleShareLocation}
              variant="solid"
              size="lg"
              style={styles.button}
              isLoading={isLoadingLocation}
              isDisabled={isLoadingLocation}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="location"
                  size={20}
                  color={theme.colors.button.primary.text}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {String(t('location.options.shareLocation'))}
                </Text>
              </View>
            </Button>

            <Button
              onPress={handleSetManually}
              variant="outline"
              size="lg"
              style={styles.button}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={theme.colors.button.secondary.text}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {String(t('location.options.setManually'))}
                </Text>
              </View>
            </Button>

            <Button
              onPress={handleDontShare}
              variant="link"
              size="lg"
              style={styles.button}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={theme.colors.button.ghost.text}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.ghostButtonText]}>
                  {String(t('location.options.dontShare'))}
                </Text>
              </View>
            </Button>

            {/* Privacy Info */}
            <View style={styles.privacyInfo}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={theme.colors.text.secondary}
                style={styles.privacyIcon}
              />
              <Text style={styles.privacyText}>
                Your location data is encrypted and only used to provide
                localized dream insights
              </Text>
            </View>
          </View>
        )}

        {locationMode === 'manual' && (
          <View style={styles.manualContainer}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Select your location for personalized dream insights
              </Text>
            </View>

            <CountryStateCityPicker
              onSelect={(data) => {
                if (data.country) {
                  setSelectedCountry(data.country.name);
                }
                if (data.state) {
                  setSelectedState(data.state.name);
                }
                if (data.city) {
                  setSelectedCity(data.city.name);
                }
              }}
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              selectedCity={selectedCity}
            />

            <Button
              onPress={() => setLocationMode('none')}
              variant="outline"
              size="md"
              style={styles.backToOptionsButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={theme.colors.text.secondary}
                  style={styles.buttonIcon}
                />
                <Text style={styles.backToOptionsText}>Back to options</Text>
              </View>
            </Button>
          </View>
        )}

        {locationMode === 'automatic' && (
          <View style={styles.successContainer}>
            <View style={styles.successCard}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={theme.colors.status.success}
                style={styles.successIcon}
              />
              <Text style={styles.successTitle}>
                Location shared successfully
              </Text>
              {selectedCountry && (
                <View style={styles.locationDetails}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={theme.colors.text.secondary}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText}>
                    {`${selectedCity ? selectedCity + ', ' : ''}${selectedState ? selectedState + ', ' : ''}${selectedCountry}`}
                  </Text>
                </View>
              )}
            </View>

            <Button
              onPress={handleSetManually}
              variant="link"
              size="md"
              style={styles.changeLocationButton}
            >
              Change location manually
            </Button>
          </View>
        )}
      </ScrollView>
    </OnboardingScreenLayout>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.xl,
    },
    buttonsContainer: {
      gap: theme.spacing.medium,
    },
    button: {
      width: '100%',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonIcon: {
      marginRight: theme.spacing.small,
    },
    buttonText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.button.primary.text,
    },
    secondaryButtonText: {
      color: theme.colors.button.secondary.text,
    },
    ghostButtonText: {
      color: theme.colors.button.ghost.text,
    },
    privacyInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.large,
    },
    privacyIcon: {
      marginRight: theme.spacing.small,
      marginTop: 2,
    },
    privacyText: {
      flex: 1,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    manualContainer: {
      gap: theme.spacing.large,
    },
    instructionContainer: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
    },
    instructionText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    backToOptionsButton: {
      alignSelf: 'center',
      marginTop: theme.spacing.medium,
    },
    backToOptionsText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
    },
    successContainer: {
      alignItems: 'center',
      gap: theme.spacing.large,
    },
    successCard: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
      borderWidth: 2,
      borderColor: theme.colors.status.success,
    },
    successIcon: {
      marginBottom: theme.spacing.medium,
    },
    successTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.small,
    },
    locationDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.medium,
    },
    locationIcon: {
      marginRight: theme.spacing.xs,
    },
    locationText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
    },
    changeLocationButton: {
      marginTop: theme.spacing.small,
    },
  });
};
