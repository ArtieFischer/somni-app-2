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
  const queueHook = useOfflineRecordingQueue(); // Use the hook instead of store directly
  const [refreshKey, setRefreshKey] = useState(0);
  const [wifiOnlyMode, setWifiOnlyMode] = useState(true); // Track WiFi-only state locally

  // Force re-render to see real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addMockRecording = () => {
    const mockSizes = [500000, 1200000, 800000, 2000000, 600000]; // Different file sizes
    const mockDurations = [30, 45, 120, 60, 90]; // Different durations
    
    const randomSize = mockSizes[Math.floor(Math.random() * mockSizes.length)];
    const randomDuration = mockDurations[Math.floor(Math.random() * mockDurations.length)];
    
    const mockRecording = {
      sessionId: `session_${Date.now()}`,
      audioUri: `file://mock_audio_${Date.now()}.wav`,
      duration: randomDuration,
      fileSize: randomSize,
      recordedAt: new Date().toISOString(),
    };

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
    // Add a recording that will likely fail
    const problematicRecording = {
      sessionId: `problematic_${Date.now()}`,
      audioUri: `file://large_audio_${Date.now()}.wav`,
      duration: 300,
      fileSize: 10000000, // 10MB - large file
      recordedAt: new Date().toISOString(),
    };

    queueHook.addRecording(problematicRecording);
    Alert.alert('Network Test', 'Added large recording (may fail for testing)');
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

  const stats = queueHook.getQueueStats();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Offline Queue Test</Text>

      {/* Network Status Card */}
      <View style={styles.networkCard}>
        <Text style={styles.cardTitle}>Network Status</Text>
        
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>
            {getNetworkStatusIcon()} Status:
          </Text>
          <Text style={[
            styles.networkValue,
            { color: queueHook.networkStatus.shouldUpload ? '#4ECDC4' : '#E74C3C' }
          ]}>
            {queueHook.networkStatus.isOnline ? 'Online' : 'Offline'} 
            ({queueHook.networkStatus.type} - {queueHook.networkStatus.quality})
          </Text>
        </View>

        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>WiFi-Only Mode:</Text>
          <Text style={[
            styles.networkValue,
            { color: wifiOnlyMode ? '#E74C3C' : '#4ECDC4' }
          ]}>
            {wifiOnlyMode ? 'ENABLED' : 'DISABLED'}
          </Text>
        </View>

        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>Can Upload:</Text>
          <Text style={[
            styles.networkValue,
            { color: queueHook.networkStatus.shouldUpload ? '#4ECDC4' : '#E74C3C' }
          ]}>
            {queueHook.networkStatus.shouldUpload ? 'YES' : 'NO'}
          </Text>
        </View>

        {queueHook.networkStatus.blockReason && (
          <View style={styles.blockReasonContainer}>
            <Text style={styles.blockReasonLabel}>Block Reason:</Text>
            <Text style={styles.blockReasonText}>{queueHook.networkStatus.blockReason}</Text>
          </View>
        )}
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
              // Add multiple recordings to test auto-retry
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  const testRecording = {
                    sessionId: `retry_test_${Date.now()}_${i}`,
                    audioUri: `file://retry_test_${Date.now()}_${i}.wav`,
                    duration: 30 + i * 10,
                    fileSize: 1000000 + i * 500000, // Varying sizes
                    recordedAt: new Date().toISOString(),
                  };
                  queueHook.addRecording(testRecording);
                }, i * 100);
              }
              Alert.alert('Auto-Retry Test', 'Added 3 recordings. Some may fail and auto-retry.');
            }}
            variant="secondary"
          />
          
          <TestButton
            title="Test Failed Upload"
            onPress={() => {
              // Add a recording that's designed to fail for testing
              const failTestRecording = {
                sessionId: `fail_test_${Date.now()}`,
                audioUri: `file://fail_test_${Date.now()}.wav`,
                duration: 45,
                fileSize: 1500000, // 1.5MB
                recordedAt: new Date().toISOString(),
              };
              queueHook.addRecording(failTestRecording);
              Alert.alert('Failure Test', 'Added recording that may fail to test auto-retry behavior.');
            }}
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
            title="Simulate Network Issue"
            onPress={simulateNetworkIssue}
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <TestButton
            title={`Retry Failed (${queueHook.failedCount})`}
            onPress={queueHook.retryFailedRecordings}
            disabled={queueHook.failedCount === 0}
            variant="secondary"
          />
          
          <TestButton
            title="Clear Completed"
            onPress={queueHook.clearCompletedRecordings}
            disabled={queueHook.completedCount === 0}
            variant="secondary"
          />
        </View>
      </View>

      {/* Queue Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Queue Statistics</Text>
        
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRecordings}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F39C12' }]}>{queueHook.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3498DB' }]}>{queueHook.uploadingCount}</Text>
            <Text style={styles.statLabel}>Uploading</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#E74C3C' }]}>{queueHook.failedCount}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Total Size:</Text>
          <Text style={styles.statRowValue}>{formatFileSize(queueHook.totalSize)}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Success Rate:</Text>
          <Text style={styles.statRowValue}>{stats.successRate.toFixed(1)}%</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Avg Upload Time:</Text>
          <Text style={styles.statRowValue}>{(stats.averageUploadTime / 1000).toFixed(1)}s</Text>
        </View>
      </View>

      {/* Queue Settings - FIXED: Now includes WiFi-only toggle */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Upload Settings</Text>
        
        {/* WiFi-Only Mode Toggle - FIXED */}
        <TouchableOpacity 
          style={styles.prominentToggle}
          onPress={() => {
            const newMode = !wifiOnlyMode;
            setWifiOnlyMode(newMode);
            queueHook.setWifiOnlyMode(newMode);
            
            // Show feedback
            Alert.alert(
              'WiFi-Only Mode', 
              `WiFi-only mode ${newMode ? 'enabled' : 'disabled'}. ${newMode ? 'Will only upload on WiFi.' : 'Will upload on WiFi and cellular.'}`
            );
          }}
        >
          <View style={styles.toggleContent}>
            <View>
              <Text style={styles.toggleTitle}>WiFi-Only Mode</Text>
              <Text style={styles.toggleSubtitle}>
                {wifiOnlyMode 
                  ? 'Only upload on WiFi networks' 
                  : 'Upload on WiFi and cellular'}
              </Text>
            </View>
            <Text style={[styles.toggleStatus, { 
              color: wifiOnlyMode ? '#E74C3C' : '#4ECDC4' 
            }]}>
              {wifiOnlyMode ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Max Retries: {stats.totalRecordings > 0 ? 3 : 'N/A'}</Text>
          <View style={styles.settingButtons}>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueHook.setMaxRetries(Math.max(1, 3 - 1))}
            >
              <Text style={styles.settingButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueHook.setMaxRetries(Math.min(10, 3 + 1))}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.toggleSetting}
          onPress={() => queueHook.setAutoRetryEnabled(true)} // This would need to be tracked in the hook
        >
          <Text style={styles.settingLabel}>Auto Retry</Text>
          <Text style={[styles.toggleStatus, { color: '#4ECDC4' }]}>
            ON
          </Text>
        </TouchableOpacity>
      </View>

      {/* Processing Status */}
      {(queueHook.pendingCount > 0 || queueHook.uploadingCount > 0 || queueHook.failedCount > 0) && (
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Processing Status</Text>
          
          {queueHook.isProcessing && (
            <Text style={styles.statusText}>🔄 Processing queue...</Text>
          )}
          
          {queueHook.uploadingCount > 0 && (
            <Text style={styles.statusText}>
              📤 {queueHook.uploadingCount} recording(s) uploading
            </Text>
          )}
          
          {queueHook.pendingCount > 0 && !queueHook.networkStatus.shouldUpload && (
            <Text style={styles.statusText}>
              ⏳ {queueHook.pendingCount} recordings waiting for better network
            </Text>
          )}
          
          {queueHook.pendingCount > 0 && queueHook.networkStatus.shouldUpload && !queueHook.isProcessing && (
            <Text style={styles.statusText}>
              🚀 {queueHook.pendingCount} recordings ready to upload
            </Text>
          )}
          
          {queueHook.failedCount > 0 && (
            <Text style={styles.statusText}>
              ❌ {queueHook.failedCount} recordings failed (will auto-retry if conditions improve)
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
  networkCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkLabel: {
    fontSize: 14,
    color: '#EAEAEA',
    fontWeight: '500',
  },
  networkValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  blockReasonContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0F3460',
    borderRadius: 6,
  },
  blockReasonLabel: {
    fontSize: 12,
    color: '#B0B3B8',
    marginBottom: 4,
  },
  blockReasonText: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
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
  prominentToggle: {
    backgroundColor: '#0F3460',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    color: '#EAEAEA',
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#B0B3B8',
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
  statusCard: {
    backgroundColor: '#16213E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#EAEAEA',
    marginBottom: 5,
  },
  bottomSpacer: {
    height: 40,
  },
});