import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { LanguageSelector } from '../../../components/molecules/LanguageSelector';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useDreamStore, useSettingsStore, useAuthStore } from '@somni/stores';
import { useStyles } from './ProfileScreen.styles';
import { supabase } from '../../../lib/supabase';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { user, profile, signOut } = useAuth();
  const { dreams, totalRecordingTime } = useDreamStore();
  const { settings, updateSettings } = useSettingsStore();
  const styles = useStyles();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const handleLanguageChange = async (newLanguage: string) => {
    if (!user?.id || newLanguage === profile?.language) {
      setShowLanguageModal(false);
      return;
    }

    setIsUpdatingLanguage(true);
    try {
      // Update in database
      const { error } = await supabase
        .from('users_profile')
        .update({ language: newLanguage })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile - we need to refetch the profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Update the auth store with new profile
      const authStore = useAuthStore.getState();
      authStore.setProfile(updatedProfile);

      Alert.alert(
        'Success',
        'Language preference updated successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Language update error:', error);
      Alert.alert(
        'Error',
        'Failed to update language preference. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdatingLanguage(false);
      setShowLanguageModal(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      String(t('actions.signOut')),
      String(t('errors.signOutConfirm')),
      [
        { text: String(t('actions.cancel')), style: 'cancel' },
        {
          text: String(t('actions.signOut')),
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert(String(t('status.error')), 'Failed to sign out. Please try again.');
              setIsSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const formatRecordingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAccountAge = () => {
    if (!profile?.createdAt) return '0 days';
    
    const createdDate = new Date(profile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const SettingRow = ({ 
    icon, 
    label, 
    value, 
    onPress 
  }: { 
    icon: string; 
    label: string; 
    value?: string | React.ReactNode; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text variant="body" style={styles.settingLabel}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {typeof value === 'string' ? (
          <Text variant="body" color="secondary" style={styles.settingValue}>
            {value}
          </Text>
        ) : (
          value
        )}
        {onPress && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text variant="h1">
              {profile?.avatarUrl ? '👤' : '🌙'}
            </Text>
          </View>
          <Text variant="h2" style={styles.username}>
            {profile?.displayName || profile?.username || user?.email?.split('@')[0] || 'Dreamer'}
          </Text>
          <Text variant="body" color="secondary">
            {user?.email}
          </Text>
          {profile?.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <Text variant="caption" style={styles.premiumText}>
                {String(t('profile.premium'))}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            {String(t('profile.stats.title'))}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {dreams.length}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('profile.stats.totalDreams'))}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {formatRecordingTime(totalRecordingTime)}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('profile.stats.recordingTime'))}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {getAccountAge()}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('profile.stats.dreamJourney'))}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            {String(t('profile.preferences.title'))}
          </Text>
          
          <SettingRow
            icon="🌙"
            label={String(t('profile.preferences.theme'))}
            value={settings.theme === 'dark' ? String(t('profile.preferences.values.dark')) : String(t('profile.preferences.values.light'))}
            onPress={() => {
              Alert.alert(String(t('profile.preferences.theme')), String(t('errors.theme')));
            }}
          />
          
          <SettingRow
            icon="🌐"
            label={String(t('profile.preferences.language'))}
            value={profile?.language === 'pl' ? 'Polski' : 'English'}
            onPress={() => setShowLanguageModal(true)}
          />
          
          <SettingRow
            icon="🔔"
            label={String(t('profile.preferences.notifications'))}
            value={
              <Switch
                value={settings.notifications.enabled}
                onValueChange={(value) => 
                  updateSettings({ 
                    notifications: { ...settings.notifications, enabled: value } 
                  })
                }
                trackColor={{ false: '#767577', true: styles.switchTrack.color }}
                thumbColor={settings.notifications.enabled ? styles.switchThumb.color : '#f4f3f4'}
              />
            }
          />
          
          <SettingRow
            icon="🎙️"
            label={String(t('profile.preferences.whisperMode'))}
            value={
              <Switch
                value={settings.recording.whisperMode}
                onValueChange={(value) => 
                  updateSettings({ 
                    recording: { ...settings.recording, whisperMode: value } 
                  })
                }
                trackColor={{ false: '#767577', true: styles.switchTrack.color }}
                thumbColor={settings.recording.whisperMode ? styles.switchThumb.color : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            {String(t('profile.support.title'))}
          </Text>
          
          <SettingRow
            icon="📚"
            label={String(t('profile.support.help'))}
            onPress={() => Alert.alert(String(t('profile.support.help')), String(t('errors.help')))}
          />
          
          <SettingRow
            icon="💬"
            label={String(t('profile.support.contact'))}
            onPress={() => Alert.alert(String(t('profile.support.contact')), String(t('errors.contact')))}
          />
          
          <SettingRow
            icon="🔒"
            label={String(t('profile.support.privacy'))}
            onPress={() => Alert.alert(String(t('profile.support.privacy')), String(t('errors.privacy')))}
          />
          
          <SettingRow
            icon="📜"
            label={String(t('profile.support.terms'))}
            onPress={() => Alert.alert(String(t('profile.support.terms')), String(t('errors.terms')))}
          />
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Button
            variant="secondary"
            size="large"
            onPress={handleSignOut}
            loading={isSigningOut}
          >
            {String(t('profile.signOut'))}
          </Button>
          
          <TouchableOpacity style={styles.dangerButton}>
            <Text variant="body" style={styles.dangerButtonText}>
              {String(t('profile.deleteAccount'))}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text variant="caption" color="secondary">
            {String(t('version.info'))}
          </Text>
          <Text variant="caption" color="secondary">
            {String(t('version.tagline'))}
          </Text>
        </View>
      </View>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text variant="h2">×</Text>
              </TouchableOpacity>
            </View>
            
            <LanguageSelector
              currentLanguage={profile?.language || 'en'}
              onLanguageChange={handleLanguageChange}
              label=""
              limitedLanguages={['en', 'pl']}
            />
            
            {isUpdatingLanguage && (
              <View style={styles.modalLoading}>
                <Text variant="body" color="secondary">Updating...</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};