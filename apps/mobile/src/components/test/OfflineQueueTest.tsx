import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useOfflineRecordingQueue } from '../../hooks/useOfflineRecordingQueue.ts'; // Import the hook
import { OfflineRecording } from '@somni/types';

const TestButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}> = ({ title, onPress, variant = 'primary', disabled = false }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'secondary' ? styles.secondaryButton : 
      variant === 'danger' ? styles.dangerButton : styles.primaryButton,
      disabled && styles.disabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export const OfflineQueueTest: React.FC = () => {
  const queueHook = useOfflineRecordingQueue();
  const [refreshKey, setRefreshKey] = useState(0);
  const [wifiOnlyMode, setWifiOnlyMode] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  
  // Mock recording list for UI display
  const [allRecordings, setAllRecordings] = useState<Array<{
    id: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    duration: number;
    fileSize: number;
    retryCount: number;
    maxRetries: number;
    recordedAt: string;
    error?: string;
  }>>([]);

  // Force re-render to see real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate network conditions
  const simulateNetworkCondition = (condition: 'wifi-excellent' | 'cellular-poor' | 'offline') => {
    console.log(`🧪 Simulating network: ${condition}`);
    
    const conditions = {
      'wifi-excellent': {
        connectionQuality: 'excellent',
        isCellular: false,
        isConnected: true,
        isInternetReachable: true,
        isWifi: true,
        type: 'wifi'
      },
      'cellular-poor': {
        connectionQuality: 'poor',
        isCellular: true,
        isConnected: true,
        isInternetReachable: true,
        isWifi: false,
        type: 'cellular'
      },
      'offline': {
        connectionQuality: 'unknown',
        isCellular: false,
        isConnected: false,
        isInternetReachable: false,
        isWifi: false,
        type: 'none'
      }
    };

    // This would trigger the network simulation in your app
    // You might need to call a function that updates the network status hook
    Alert.alert('Network Simulation', `Switched to: ${condition}`);
  };

  const addMockRecording = () => {
    const mockSizes = [500000, 1200000, 800000, 2000000, 600000];
    const mockDurations = [30, 45, 120, 60, 90];
    
    const randomSize = mockSizes[Math.floor(Math.random() * mockSizes.length)];
    const randomDuration = mockDurations[Math.floor(Math.random() * mockDurations.length)];
    
    const mockRecording = {
      sessionId: `session_${Date.now()}`,
      audioUri: `file://mock_audio_${Date.now()}.wav`,
      duration: randomDuration,
      fileSize: randomSize,
      recordedAt: new Date().toISOString(),
    };

    // Add to our local tracking
    const newRecording = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending' as const,
      duration: randomDuration,
      fileSize: randomSize,
      retryCount: 0,
      maxRetries: maxRetries,
      recordedAt: new Date().toISOString(),
    };
    
    setAllRecordings(prev => [newRecording, ...prev]);
    queueHook.addRecording(mockRecording);
    
    Alert.alert(
      'Recording Added!',
      `Duration: ${randomDuration}s\nSize: ${Math.round(randomSize / 1024)}KB`
    );
  };

  const addMultipleRecordings = () => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => addMockRecording(), i * 200);
    }
    Alert.alert('Multiple Recordings', `Added ${count} recordings to queue`);
  };

  const simulateNetworkIssue = () => {
    const problematicRecording = {
      sessionId: `problematic_${Date.now()}`,
      audioUri: `file://large_audio_${Date.now()}.wav`,
      duration: 300,
      fileSize: 10000000, // 10MB - large file
      recordedAt: new Date().toISOString(),
    };

    const newRecording = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending' as const,
      duration: 300,
      fileSize: 10000000,
      retryCount: 0,
      maxRetries: maxRetries,
      recordedAt: new Date().toISOString(),
    };
    
    setAllRecordings(prev => [newRecording, ...prev]);
    queueHook.addRecording(problematicRecording);
    Alert.alert('Network Test', 'Added large recording (may fail for testing)');
  };

  const updateMaxRetries = (newRetries: number) => {
    setMaxRetries(newRetries);
    queueHook.setMaxRetries(newRetries);
    Alert.alert('Max Retries Updated', `Set to ${newRetries} retries`);
  };

  const clearAllRecordings = () => {
    Alert.alert(
      'Clear All Recordings',
      'This will remove all recordings from queue and history. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => {
            setAllRecordings([]);
            queueHook.clearAllRecordings();
            Alert.alert('Cleared', 'All recordings cleared!');
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNetworkStatusIcon = (): string => {
    const { networkStatus } = queueHook;
    
    if (!networkStatus.isOnline) return '🔴';
    if (networkStatus.isWifi && networkStatus.quality === 'excellent') return '🟢';
    if (networkStatus.isWifi && networkStatus.quality === 'good') return '🟡';
    if (networkStatus.isWifi) return '🟠';
    if (networkStatus.type === 'cellular' && networkStatus.quality === 'excellent') return '📶';
    if (networkStatus.type === 'cellular') return '📱';
    return '⚪';
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'uploading': return '#3498DB';
      case 'completed': return '#4ECDC4';
      case 'failed': return '#E74C3C';
      default: return '#B0B3B8';
    }
  };

  const stats = queueHook.getQueueStats();
  const pendingRecordings = allRecordings.filter(r => r.status === 'pending');
  const uploadingRecordings = allRecordings.filter(r => r.status === 'uploading');
  const completedRecordings = allRecordings.filter(r => r.status === 'completed');
  const failedRecordings = allRecordings.filter(r => r.status === 'failed');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Offline Queue Test</Text>

      {/* WiFi-Only Control - PROMINENT */}
      <View style={styles.wifiControlCard}>
        <Text style={styles.cardTitle}>🔧 Network Controls</Text>
        
        <TouchableOpacity 
          style={[styles.bigToggle, { backgroundColor: wifiOnlyMode ? '#E74C3C' : '#4ECDC4' }]}
          onPress={() => {
            const newMode = !wifiOnlyMode;
            setWifiOnlyMode(newMode);
            queueHook.setWifiOnlyMode(newMode);
            
            Alert.alert(
              'WiFi-Only Mode', 
              `WiFi-only mode ${newMode ? 'enabled' : 'disabled'}. ${newMode ? 'Will only upload on WiFi.' : 'Will upload on WiFi and cellular.'}`
            );
          }}
        >
          <Text style={styles.bigToggleTitle}>
            📶 WiFi-Only Mode: {wifiOnlyMode ? 'ON' : 'OFF'}
          </Text>
          <Text style={styles.bigToggleSubtitle}>
            {wifiOnlyMode 
              ? 'Tap to allow cellular uploads' 
              : 'Tap to restrict to WiFi only'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.networkStatusRow}>
          <Text style={styles.statusLabel}>Current Network:</Text>
          <Text style={[styles.statusValue, { 
            color: queueHook.networkStatus.isWifi ? '#4ECDC4' : '#F39C12' 
          }]}>
            {queueHook.networkStatus.type.toUpperCase()} ({queueHook.networkStatus.quality})
          </Text>
        </View>
        
        <View style={styles.networkStatusRow}>
          <Text style={styles.statusLabel}>Upload Allowed:</Text>
          <Text style={[styles.statusValue, { 
            color: queueHook.networkStatus.shouldUpload ? '#4ECDC4' : '#E74C3C' 
          }]}>
            {queueHook.networkStatus.shouldUpload ? '✅ YES' : '❌ NO'}
          </Text>
        </View>

        {/* Network Simulation Buttons */}
        <Text style={styles.networkSimTitle}>Network Simulation:</Text>
        <View style={styles.buttonRow}>
          <TestButton
            title="WiFi Excellent"
            onPress={() => simulateNetworkCondition('wifi-excellent')}
            variant="secondary"
          />
          
          <TestButton
            title="Cellular Poor"
            onPress={() => simulateNetworkCondition('cellular-poor')}
            variant="secondary"
          />
        </View>
        
        <TestButton
          title="Go Offline"
          onPress={() => simulateNetworkCondition('offline')}
          variant="secondary"
        />
      </View>

      {/* Current Upload Progress */}
      {queueHook.currentUpload && (
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Current Upload</Text>
          <Text style={styles.progressText}>
            Recording: {queueHook.currentUpload.recordingId.substring(0, 12)}...
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${queueHook.currentUpload.progress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {queueHook.currentUpload.progress.percentage.toFixed(1)}% 
            ({formatFileSize(queueHook.currentUpload.progress.loaded)} / {formatFileSize(queueHook.currentUpload.progress.total)})
          </Text>
          {queueHook.currentUpload.progress.speed && (
            <Text style={styles.progressDetail}>
              Speed: {formatFileSize(queueHook.currentUpload.progress.speed)}/s
            </Text>
          )}
        </View>
      )}

      {/* Queue Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Actions</Text>
        
        <View style={styles.buttonRow}>
          <TestButton
            title="Add Recording"
            onPress={addMockRecording}
            variant="primary"
          />
          
          <TestButton
            title="Add 5 Recordings"
            onPress={addMultipleRecordings}
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <TestButton
            title="Force Auto-Retry Test"
            onPress={() => {
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  const testRecording = {
                    sessionId: `retry_test_${Date.now()}_${i}`,
                    audioUri: `file://retry_test_${Date.now()}_${i}.wav`,
                    duration: 30 + i * 10,
                    fileSize: 1000000 + i * 500000,
                    recordedAt: new Date().toISOString(),
                  };
                  
                  const newRecording = {
                    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'pending' as const,
                    duration: 30 + i * 10,
                    fileSize: 1000000 + i * 500000,
                    retryCount: 0,
                    maxRetries: maxRetries,
                    recordedAt: new Date().toISOString(),
                  };
                  
                  setAllRecordings(prev => [newRecording, ...prev]);
                  queueHook.addRecording(testRecording);
                }, i * 100);
              }
              Alert.alert('Auto-Retry Test', 'Added 3 recordings. Some may fail and auto-retry.');
            }}
            variant="secondary"
          />
          
          <TestButton
            title="Simulate Network Issue"
            onPress={simulateNetworkIssue}
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <TestButton
            title={queueHook.isProcessing ? 'Processing...' : 'Process Queue'}
            onPress={queueHook.processQueue}
            disabled={queueHook.isProcessing || queueHook.pendingCount === 0}
            variant="primary"
          />
          
          <TestButton
            title={`Retry Failed (${queueHook.failedCount})`}
            onPress={queueHook.retryFailedRecordings}
            disabled={queueHook.failedCount === 0}
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <TestButton
            title="Clear Completed"
            onPress={queueHook.clearCompletedRecordings}
            disabled={queueHook.completedCount === 0}
            variant="secondary"
          />
          
          <TestButton
            title="Clear All Recordings"
            onPress={clearAllRecordings}
            variant="danger"
          />
        </View>
      </View>

      {/* Queue Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Queue Statistics</Text>
        
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allRecordings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F39C12' }]}>{pendingRecordings.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3498DB' }]}>{uploadingRecordings.length}</Text>
            <Text style={styles.statLabel}>Uploading</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4ECDC4' }]}>{completedRecordings.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#E74C3C' }]}>{failedRecordings.length}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Total Size:</Text>
          <Text style={styles.statRowValue}>
            {formatFileSize(allRecordings.reduce((sum, r) => sum + r.fileSize, 0))}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Success Rate:</Text>
          <Text style={styles.statRowValue}>
            {allRecordings.length > 0 
              ? ((completedRecordings.length / allRecordings.length) * 100).toFixed(1) 
              : '0.0'}%
          </Text>
        </View>
      </View>

      {/* Queue Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Upload Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Max Retries: {maxRetries}</Text>
          <View style={styles.settingButtons}>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => updateMaxRetries(Math.max(1, maxRetries - 1))}
            >
              <Text style={styles.settingButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => updateMaxRetries(Math.min(10, maxRetries + 1))}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.toggleSetting}
          onPress={() => queueHook.setAutoRetryEnabled(true)}
        >
          <Text style={styles.settingLabel}>Auto Retry</Text>
          <Text style={[styles.toggleStatus, { color: '#4ECDC4' }]}>
            ON
          </Text>
        </TouchableOpacity>
      </View>

      {/* Failed Recordings List */}
      {failedRecordings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ Failed Recordings ({failedRecordings.length})</Text>
          
          {failedRecordings.map((recording, index) => (
            <View key={recording.id} style={[styles.recordingCard, { borderLeftColor: '#E74C3C' }]}>
              <View style={styles.recordingHeader}>
                <Text style={styles.recordingId}>
                  {getStatusIcon(recording.status)} {recording.id.substring(0, 12)}...
                </Text>
                <Text style={[styles.recordingStatus, { color: getStatusColor(recording.status) }]}>
                  FAILED
                </Text>
              </View>
              
              <View style={styles.recordingDetails}>
                <Text style={styles.recordingDetail}>
                  {formatDuration(recording.duration)} • {formatFileSize(recording.fileSize)}
                </Text>
                <Text style={styles.recordingDetail}>
                  Retries: {recording.retryCount}/{recording.maxRetries}
                </Text>
                {recording.error && (
                  <Text style={styles.errorText} numberOfLines={1}>
                    Error: {recording.error}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pending/Uploading Recordings */}
      {(pendingRecordings.length > 0 || uploadingRecordings.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔄 Active Queue ({pendingRecordings.length + uploadingRecordings.length})
          </Text>
          
          {[...uploadingRecordings, ...pendingRecordings].map((recording, index) => (
            <View key={recording.id} style={[styles.recordingCard, { 
              borderLeftColor: getStatusColor(recording.status) 
            }]}>
              <View style={styles.recordingHeader}>
                <Text style={styles.recordingId}>
                  {getStatusIcon(recording.status)} {recording.id.substring(0, 12)}...
                </Text>
                <Text style={[styles.recordingStatus, { color: getStatusColor(recording.status) }]}>
                  {recording.status.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.recordingDetails}>
                <Text style={styles.recordingDetail}>
                  {formatDuration(recording.duration)} • {formatFileSize(recording.fileSize)}
                </Text>
                {recording.retryCount > 0 && (
                  <Text style={styles.recordingDetail}>
                    Retries: {recording.retryCount}/{recording.maxRetries}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Completed Recordings */}
      {completedRecordings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Completed Uploads ({completedRecordings.length})</Text>
          
          {completedRecordings.slice(0, 5).map((recording, index) => (
            <View key={recording.id} style={[styles.recordingCard, { borderLeftColor: '#4ECDC4' }]}>
              <View style={styles.recordingHeader}>
                <Text style={styles.recordingId}>
                  {getStatusIcon(recording.status)} {recording.id.substring(0, 12)}...
                </Text>
                <Text style={[styles.recordingStatus, { color: getStatusColor(recording.status) }]}>
                  COMPLETED
                </Text>
              </View>
              
              <View style={styles.recordingDetails}>
                <Text style={styles.recordingDetail}>
                  {formatDuration(recording.duration)} • {formatFileSize(recording.fileSize)}
                </Text>
                <Text style={styles.recordingDetail}>
                  {new Date(recording.recordedAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
          
          {completedRecordings.length > 5 && (
            <Text style={styles.moreText}>
              + {completedRecordings.length - 5} more completed recordings
            </Text>
          )}
        </View>
      )}

      <View style={styles.bottomSpacer} />
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
  wifiControlCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  bigToggle: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  bigToggleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  bigToggleSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  networkStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#EAEAEA',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  networkSimTitle: {
    fontSize: 14,
    color: '#EAEAEA',
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  progressCard: {
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
  progressText: {
    fontSize: 14,
    color: '#EAEAEA',
    marginBottom: 8,
  },
  progressDetail: {
    fontSize: 12,
    color: '#B0B3B8',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0F3460',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
  },
  secondaryButton: {
    backgroundColor: '#0F3460',
  },
  dangerButton: {
    backgroundColor: '#E74C3C',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 11,
    color: '#B0B3B8',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#EAEAEA',
  },
  statRowValue: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    color: '#EAEAEA',
  },
  settingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    width: 32,
    height: 32,
    backgroundColor: '#0F3460',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingButtonText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  toggleStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordingCard: {
    backgroundColor: '#0F3460',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingId: {
    fontSize: 12,
    color: '#B0B3B8',
    fontWeight: '600',
  },
  recordingStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordingDetails: {
    gap: 2,
  },
  recordingDetail: {
    fontSize: 12,
    color: '#EAEAEA',
  },
  errorText: {
    fontSize: 11,
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  moreText: {
    fontSize: 12,
    color: '#B0B3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  bottomSpacer: {
    height: 40,
  },
});