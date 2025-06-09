import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const TestButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}> = ({ title, onPress, variant = 'primary', disabled = false }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
      disabled && styles.disabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export const NetworkStatusTest: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const [isChecking, setIsChecking] = useState(false);
  const [manualCheckResult, setManualCheckResult] = useState<boolean | null>(null);

  const handleManualCheck = async () => {
    setIsChecking(true);
    setManualCheckResult(null);
    
    try {
      const result = await networkStatus.checkConnection();
      setManualCheckResult(result);
    } catch (error) {
      setManualCheckResult(false);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (networkStatus.isOnline) {
      return networkStatus.connectionQuality === 'excellent' ? '#4ECDC4' : 
             networkStatus.connectionQuality === 'good' ? '#F39C12' : '#E67E22';
    }
    return '#E74C3C';
  };

  const getStatusIcon = () => {
    if (!networkStatus.isConnected) return '📵';
    if (!networkStatus.isInternetReachable) return '⚠️';
    if (networkStatus.isWifi) return '📶';
    if (networkStatus.isCellular) return '📱';
    return '🌐';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Status Test</Text>

      {/* Status Overview */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {networkStatus.getConnectionStatusText()}
          </Text>
        </View>
        
        <View style={styles.statusDetails}>
          <Text style={styles.detailText}>
            Last checked: {networkStatus.lastConnectionCheck?.toLocaleTimeString() || 'Never'}
          </Text>
        </View>
      </View>

      {/* Manual Check */}
      <View style={styles.section}>
        <TestButton
          title={isChecking ? 'Checking...' : 'Manual Connection Check'}
          onPress={handleManualCheck}
          disabled={isChecking}
        />
        
        {manualCheckResult !== null && (
          <Text style={[
            styles.checkResult,
            { color: manualCheckResult ? '#4ECDC4' : '#E74C3C' }
          ]}>
            Manual check result: {manualCheckResult ? 'Connected ✅' : 'Disconnected ❌'}
          </Text>
        )}
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Connection Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connected:</Text>
          <Text style={[styles.detailValue, { color: networkStatus.isConnected ? '#4ECDC4' : '#E74C3C' }]}>
            {networkStatus.isConnected ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Internet Reachable:</Text>
          <Text style={[styles.detailValue, { color: networkStatus.isInternetReachable ? '#4ECDC4' : '#E74C3C' }]}>
            {networkStatus.isInternetReachable ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connection Type:</Text>
          <Text style={styles.detailValue}>{networkStatus.type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>WiFi:</Text>
          <Text style={styles.detailValue}>{networkStatus.isWifi ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cellular:</Text>
          <Text style={styles.detailValue}>{networkStatus.isCellular ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quality:</Text>
          <Text style={styles.detailValue}>{networkStatus.connectionQuality}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Online Status:</Text>
          <Text style={[styles.detailValue, { color: networkStatus.isOnline ? '#4ECDC4' : '#E74C3C' }]}>
            {networkStatus.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Test Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>Test Instructions</Text>
        <Text style={styles.instructionText}>
          1. Check status with WiFi connected{'\n'}
          2. Disable WiFi, enable cellular{'\n'}
          3. Enable airplane mode{'\n'}
          4. Try manual check in each state{'\n'}
          5. Watch real-time status updates
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#EAEAEA',
  },
  statusCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#B0B3B8',
  },
  section: {
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
  },
  secondaryButton: {
    backgroundColor: '#FF6B6B',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkResult: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#EAEAEA',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#B0B3B8',
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#0F3460',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#B0B3B8',
    lineHeight: 20,
  },
});