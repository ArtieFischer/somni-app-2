import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Modal, 
  FlatList, 
  TextInput, 
  Pressable, 
  SafeAreaView, 
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Country, State, City } from 'country-state-city';
import { Text } from '../../atoms/Text';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CountryStateCityPickerProps {
  onSelect: (data: {
    country?: { name: string; code: string };
    state?: { name: string; code: string };
    city?: { name: string };
  }) => void;
  selectedCountry?: string;
  selectedState?: string;
  selectedCity?: string;
}

type PickerMode = 'country' | 'state' | 'city' | null;

export const CountryStateCityPicker: React.FC<CountryStateCityPickerProps> = ({
  onSelect,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const searchInputRef = useRef<TextInput>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedCountryData, setSelectedCountryData] = useState<{ name: string; code: string } | null>(null);
  const [selectedStateData, setSelectedStateData] = useState<{ name: string; code: string } | null>(null);
  const [selectedCityData, setSelectedCityData] = useState<{ name: string } | null>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    // Load countries on mount
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    // Load states when country is selected
    if (selectedCountryData?.code) {
      setLoading(true);
      setTimeout(() => {
        const countryStates = State.getStatesOfCountry(selectedCountryData.code);
        setStates(countryStates);
        setLoading(false);
      }, 100);
    }
  }, [selectedCountryData]);

  useEffect(() => {
    // Load cities when state is selected
    if (selectedCountryData?.code && selectedStateData?.code) {
      setLoading(true);
      setTimeout(() => {
        const stateCities = City.getCitiesOfState(selectedCountryData.code, selectedStateData.code);
        setCities(stateCities);
        setLoading(false);
      }, 100);
    }
  }, [selectedCountryData, selectedStateData]);

  const openPicker = (mode: PickerMode) => {
    setPickerMode(mode);
    setModalVisible(true);
    setSearchQuery('');
    // Focus search input after modal opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  const closePicker = () => {
    setModalVisible(false);
    setPickerMode(null);
    setSearchQuery('');
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountryData({ name: country.name, code: country.isoCode });
    setSelectedStateData(null);
    setSelectedCityData(null);
    onSelect({ 
      country: { name: country.name, code: country.isoCode },
      state: undefined,
      city: undefined,
    });
    closePicker();
  };

  const handleStateSelect = (state: any) => {
    setSelectedStateData({ name: state.name, code: state.isoCode });
    setSelectedCityData(null);
    onSelect({ 
      country: selectedCountryData!,
      state: { name: state.name, code: state.isoCode },
      city: undefined,
    });
    closePicker();
  };

  const handleCitySelect = (city: any) => {
    setSelectedCityData({ name: city.name });
    onSelect({ 
      country: selectedCountryData!,
      state: selectedStateData!,
      city: { name: city.name },
    });
    closePicker();
  };

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    
    switch (pickerMode) {
      case 'country':
        return countries.filter(country => 
          country.name.toLowerCase().includes(query)
        );
      case 'state':
        return states.filter(state => 
          state.name.toLowerCase().includes(query)
        );
      case 'city':
        return cities.filter(city => 
          city.name.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const onPress = () => {
      switch (pickerMode) {
        case 'country':
          handleCountrySelect(item);
          break;
        case 'state':
          handleStateSelect(item);
          break;
        case 'city':
          handleCitySelect(item);
          break;
      }
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.listItem,
          pressed && styles.listItemPressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.listItemText}>{item.name}</Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={theme.colors.text.secondary}
        />
      </Pressable>
    );
  };

  const getEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No {pickerMode}s found matching "{searchQuery}"
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Country Selector */}
      <View style={styles.selectorWrapper}>
        <Text style={styles.label}>Country</Text>
        <Pressable
          style={({ pressed }) => [
            styles.selector,
            pressed && styles.selectorPressed,
          ]}
          onPress={() => openPicker('country')}
        >
          <Text style={[
            styles.selectorText,
            !selectedCountryData && styles.selectorTextPlaceholder
          ]}>
            {selectedCountryData?.name || 'Select Country'}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.text.secondary} 
          />
        </Pressable>
      </View>

      {/* State Selector */}
      {selectedCountryData && states.length > 0 && (
        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>State/Province</Text>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => openPicker('state')}
          >
            <Text style={[
              styles.selectorText,
              !selectedStateData && styles.selectorTextPlaceholder
            ]}>
              {selectedStateData?.name || 'Select State (Optional)'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={theme.colors.text.secondary} 
            />
          </Pressable>
        </View>
      )}

      {/* City Selector */}
      {selectedStateData && cities.length > 0 && (
        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>City</Text>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.selectorPressed,
            ]}
            onPress={() => openPicker('city')}
          >
            <Text style={[
              styles.selectorText,
              !selectedCityData && styles.selectorTextPlaceholder
            ]}>
              {selectedCityData?.name || 'Select City (Optional)'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={theme.colors.text.secondary} 
            />
          </Pressable>
        </View>
      )}

      {/* Selected Location Summary */}
      {(selectedCountryData || selectedStateData || selectedCityData) && (
        <View style={styles.summaryContainer}>
          <Ionicons 
            name="location-outline" 
            size={16} 
            color={theme.colors.primary}
            style={styles.summaryIcon}
          />
          <Text style={styles.summaryText}>
            {[selectedCityData?.name, selectedStateData?.name, selectedCountryData?.name]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </View>
      )}

      {/* Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePicker}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text variant="h3" style={styles.modalTitle}>
                  Select {pickerMode?.charAt(0).toUpperCase() + pickerMode?.slice(1)}
                </Text>
                <Pressable onPress={closePicker} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </Pressable>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={theme.colors.text.secondary} 
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder={`Search ${pickerMode}...`}
                  placeholderTextColor={theme.colors.text.secondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Ionicons 
                      name="close-circle" 
                      size={20} 
                      color={theme.colors.text.secondary}
                    />
                  </Pressable>
                )}
              </View>

              {/* List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={getFilteredData()}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.isoCode || item.name}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={21}
                  ListEmptyComponent={getEmptyComponent()}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              )}
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.medium,
    },
    selectorWrapper: {
      marginBottom: theme.spacing.small,
    },
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
    },
    selectorPressed: {
      opacity: 0.8,
      borderColor: theme.colors.primary,
    },
    selectorText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
      flex: 1,
    },
    selectorTextPlaceholder: {
      color: theme.colors.text.secondary,
    },
    summaryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.small,
    },
    summaryIcon: {
      marginRight: theme.spacing.small,
    },
    summaryText: {
      flex: 1,
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
      fontWeight: '500' as any,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large,
      height: '85%',
      maxHeight: '85%',
    },
    modalSafeArea: {
      flex: 1,
      height: '100%',
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      paddingHorizontal: theme.spacing.medium,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    searchIcon: {
      marginRight: theme.spacing.small,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.medium,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      backgroundColor: theme.colors.background.primary,
    },
    listItemPressed: {
      backgroundColor: theme.colors.background.secondary,
    },
    listItemText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
      fontWeight: '400' as any,
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border.primary,
      marginHorizontal: theme.spacing.large,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
};