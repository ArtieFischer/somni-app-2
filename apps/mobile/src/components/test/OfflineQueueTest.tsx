import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useOfflineQueueStore } from '@somni/stores';
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
  const queueStore = useOfflineQueueStore();
  const [refreshKey, setRefreshKey] = useState(0);

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
      maxRetries: 3
    };

    queueStore.addRecording(mockRecording);
    
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
      maxRetries: 2
    };

    queueStore.addRecording(problematicRecording);
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

  const getStatusColor = (status: OfflineRecording['status']): string => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'uploading': return '#3498DB';
      case 'completed': return '#4ECDC4';
      case 'failed': return '#E74C3C';
      default: return '#B0B3B8';
    }
  };

  const getStatusIcon = (status: OfflineRecording['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const stats = queueStore.getQueueStats();
  const recentHistory = queueStore.getUploadHistory(5);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Offline Queue Test</Text>

      {/* Current Upload Progress */}
      {queueStore.currentUpload && (
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Current Upload</Text>
          <Text style={styles.progressText}>
            Recording: {queueStore.currentUpload.recordingId.substring(0, 12)}...
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${queueStore.currentUpload.progress.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {queueStore.currentUpload.progress.percentage.toFixed(1)}% 
            ({formatFileSize(queueStore.currentUpload.progress.loaded)} / {formatFileSize(queueStore.currentUpload.progress.total)})
          </Text>
          {queueStore.currentUpload.progress.speed && (
            <Text style={styles.progressDetail}>
              Speed: {formatFileSize(queueStore.currentUpload.progress.speed)}/s
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
            title={queueStore.isProcessing ? 'Processing...' : 'Process Queue'}
            onPress={queueStore.processQueue}
            disabled={queueStore.isProcessing || stats.pendingCount === 0}
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
            title={`Retry Failed (${stats.failedCount})`}
            onPress={queueStore.retryFailedRecordings}
            disabled={stats.failedCount === 0}
            variant="secondary"
          />
          
          <TestButton
            title="Clear Completed"
            onPress={queueStore.clearCompletedRecordings}
            disabled={stats.completedCount === 0}
            variant="secondary"
          />
        </View>

        <TestButton
          title="Clear All Queue"
          onPress={() => {
            Alert.alert(
              'Clear Queue',
              'Remove all recordings from queue?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: queueStore.clearAllRecordings }
              ]
            );
          }}
          variant="danger"
        />
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
            <Text style={[styles.statValue, { color: '#F39C12' }]}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3498DB' }]}>{stats.uploadingCount}</Text>
            <Text style={styles.statLabel}>Uploading</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#E74C3C' }]}>{stats.failedCount}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Total Size:</Text>
          <Text style={styles.statRowValue}>{formatFileSize(stats.totalSize)}</Text>
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

      {/* Queue Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Max Retries: {queueStore.maxRetries}</Text>
          <View style={styles.settingButtons}>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueStore.setMaxRetries(Math.max(1, queueStore.maxRetries - 1))}
            >
              <Text style={styles.settingButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueStore.setMaxRetries(Math.min(10, queueStore.maxRetries + 1))}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Batch Size: {queueStore.batchSize}</Text>
          <View style={styles.settingButtons}>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueStore.setBatchSize(Math.max(1, queueStore.batchSize - 1))}
            >
              <Text style={styles.settingButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingButton} 
              onPress={() => queueStore.setBatchSize(Math.min(10, queueStore.batchSize + 1))}
            >
              <Text style={styles.settingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.toggleSetting}
          onPress={() => queueStore.setWifiOnlyMode(!queueStore.wifiOnlyMode)}
        >
          <Text style={styles.settingLabel}>WiFi Only Mode</Text>
          <Text style={[styles.toggleStatus, { 
            color: queueStore.wifiOnlyMode ? '#4ECDC4' : '#B0B3B8' 
          }]}>
            {queueStore.wifiOnlyMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toggleSetting}
          onPress={() => queueStore.setAutoRetryEnabled(!queueStore.autoRetryEnabled)}
        >
          <Text style={styles.settingLabel}>Auto Retry</Text>
          <Text style={[styles.toggleStatus, { 
            color: queueStore.autoRetryEnabled ? '#4ECDC4' : '#B0B3B8' 
          }]}>
            {queueStore.autoRetryEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Recordings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Recordings ({queueStore.recordings.slice(0, 5).length})</Text>
        
        {queueStore.recordings.slice(0, 5).map((recording) => (
          <View key={recording.id} style={styles.recordingCard}>
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
              {recording.error && (
                <Text style={styles.errorText} numberOfLines={1}>
                  Error: {recording.error}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => queueStore.removeRecording(recording.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {queueStore.recordings.length === 0 && (
          <Text style={styles.emptyText}>
            No recordings in queue. Add some recordings to test!
          </Text>
        )}
      </View>

      {/* Upload History */}
      {recentHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Upload History</Text>
          
          {recentHistory.map((historyItem, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyId}>
                  {historyItem.success ? '✅' : '❌'} {historyItem.recordingId.substring(0, 12)}...
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(historyItem.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.historyDetail}>
                {formatFileSize(historyItem.fileSize)} • {(historyItem.duration / 1000).toFixed(1)}s
              </Text>
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 10,
  },
  recordingDetail: {
    fontSize: 12,
    color: '#EAEAEA',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  removeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2C1810',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#B0B3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#0F3460',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyId: {
    fontSize: 12,
    color: '#B0B3B8',
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 11,
    color: '#B0B3B8',
  },
  historyDetail: {
    fontSize: 11,
    color: '#EAEAEA',
  },
});