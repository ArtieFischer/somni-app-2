import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useDreamStore } from '@somni/stores';
import { useSettingsStore } from '@somni/stores';
import { useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { user, profile, signOut } = useAuth();
  const { dreams, totalRecordingTime } = useDreamStore();
  const { settings, updateSettings } = useSettingsStore();
  const styles = useStyles();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
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
                Premium Member
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Dream Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {dreams.length}
              </Text>
              <Text variant="caption" color="secondary">
                Total Dreams
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {formatRecordingTime(totalRecordingTime)}
              </Text>
              <Text variant="caption" color="secondary">
                Recording Time
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="h2" style={styles.statValue}>
                {getAccountAge()}
              </Text>
              <Text variant="caption" color="secondary">
                Dream Journey
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Preferences
          </Text>
          
          <SettingRow
            icon="🌙"
            label="Theme"
            value={settings.theme === 'dark' ? 'Dark' : 'Light'}
            onPress={() => {
              // In future, open theme selector
              Alert.alert('Theme', 'Theme selection coming soon!');
            }}
          />
          
          <SettingRow
            icon="🌐"
            label="Language"
            value={settings.language === 'en' ? 'English' : 'Spanish'}
            onPress={() => {
              // In future, open language selector
              Alert.alert('Language', 'Language selection coming soon!');
            }}
          />
          
          <SettingRow
            icon="🔔"
            label="Notifications"
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
            label="Whisper Mode"
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
            Support
          </Text>
          
          <SettingRow
            icon="📚"
            label="Help & FAQ"
            onPress={() => Alert.alert('Help', 'Help documentation coming soon!')}
          />
          
          <SettingRow
            icon="💬"
            label="Contact Us"
            onPress={() => Alert.alert('Contact', 'support@somni.app')}
          />
          
          <SettingRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
          />
          
          <SettingRow
            icon="📜"
            label="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
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
            {t('profile.signOut')}
          </Button>
          
          <TouchableOpacity style={styles.dangerButton}>
            <Text variant="body" style={styles.dangerButtonText}>
              {t('profile.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text variant="caption" color="secondary">
            Somni v1.0.0
          </Text>
          <Text variant="caption" color="secondary">
            Made with 💜 for dreamers
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};