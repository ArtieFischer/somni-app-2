import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from './LanguageSelector.styles';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// ElevenLabs supported languages (subset of the 99 available)
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  label?: string;
  limitedLanguages?: string[]; // Optional prop to limit available languages
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  label = 'Transcription Language',
  limitedLanguages,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const styles = useStyles();
  
  // Filter languages if limitedLanguages prop is provided
  const availableLanguages = limitedLanguages 
    ? SUPPORTED_LANGUAGES.filter(lang => limitedLanguages.includes(lang.code))
    : SUPPORTED_LANGUAGES;
  
  const selectedLanguage = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language.code);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.selectedText}>
              {selectedLanguage.name} ({selectedLanguage.nativeName})
            </Text>
            <Ionicons name="chevron-down" size={20} color={styles.chevronColor.color} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={styles.closeIconColor.color} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    item.code === currentLanguage && styles.selectedLanguageItem,
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                >
                  <View>
                    <Text style={[
                      styles.languageName,
                      item.code === currentLanguage && styles.selectedLanguageText,
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.languageNativeName,
                      item.code === currentLanguage && styles.selectedLanguageText,
                    ]}>
                      {item.nativeName}
                    </Text>
                  </View>
                  {item.code === currentLanguage && (
                    <Ionicons name="checkmark" size={24} color={styles.checkmarkColor.color} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.languageList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};