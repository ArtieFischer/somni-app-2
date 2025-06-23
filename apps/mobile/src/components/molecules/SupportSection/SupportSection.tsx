import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Text, Card } from '../../atoms';
import { 
  Box,
  VStack,
  HStack,
  Heading,
  Divider
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './SupportSection.styles';
import { MainTabScreenProps } from '@somni/types';
import { Ionicons } from '@expo/vector-icons';
import { ProfileIcons } from '../../../constants/profileIcons';
import { useTheme } from '../../../hooks/useTheme';

export const SupportSection: React.FC = () => {
  const { t } = useTranslation('auth');
  const styles = useStyles();
  const theme = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Profile'>['navigation']>();

  const SupportRow = ({ 
    iconKey, 
    label, 
    onPress 
  }: { 
    iconKey: keyof typeof ProfileIcons; 
    label: string; 
    onPress: () => void;
  }) => {
    const iconConfig = ProfileIcons[iconKey];
    const IconComponent = iconConfig.family;
    
    return (
    <TouchableOpacity 
      style={styles.supportRow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <HStack justifyContent="space-between" alignItems="center" flex={1}>
        <HStack space="md" alignItems="center" flex={1}>
          <IconComponent 
            name={iconConfig.name as any} 
            size={24} 
            color={theme.colors.text.secondary}
          />
          <Text variant="body" style={styles.supportLabel}>
            {label}
          </Text>
        </HStack>
        <Text style={styles.chevron}>›</Text>
      </HStack>
    </TouchableOpacity>
    );
  };

  return (
    <Card>
      <VStack space="md">
        <Heading size="md" style={styles.sectionTitle}>
          {String(t('profile.support.title'))}
        </Heading>

        <VStack space="xs">
          <SupportRow
            iconKey="helpCenter"
            label={String(t('profile.support.help'))}
            onPress={() => Alert.alert(String(t('profile.support.help')), String(t('errors.help')))}
          />
          
          <Divider style={styles.divider} />

          <SupportRow
            iconKey="contactSupport"
            label={String(t('profile.support.contact'))}
            onPress={() => Alert.alert(String(t('profile.support.contact')), String(t('errors.contact')))}
          />
          
          <Divider style={styles.divider} />

          <SupportRow
            iconKey="privacyPolicy"
            label={String(t('profile.support.privacy'))}
            onPress={() => Alert.alert(String(t('profile.support.privacy')), String(t('errors.privacy')))}
          />
          
          <Divider style={styles.divider} />

          <SupportRow
            iconKey="termsOfService"
            label={String(t('profile.support.terms'))}
            onPress={() => Alert.alert(String(t('profile.support.terms')), String(t('errors.terms')))}
          />
          
          <Divider style={styles.divider} />

          <SupportRow
            iconKey="debugSettings"
            label="Debug Settings"
            onPress={() => navigation.navigate('Debug')}
          />
        </VStack>
      </VStack>
    </Card>
  );
};