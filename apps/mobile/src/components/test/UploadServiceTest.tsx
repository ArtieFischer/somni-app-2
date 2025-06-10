import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ProgressiveUploadService } from '@somni/stores';
import { NetworkCondition, UploadProgress } from '@somni/types';

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

export const UploadServiceTest: React.FC = () => {
  const [uploadService] = useState(() => new ProgressiveUploadService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUpload, setCurrentUpload] = useState<{
    id: string;
    progress: UploadProgress;
    strategy: string;
  } | null>(null);
  const [uploadHistory, setUploadHistory] = useState<Array<{
    id: string;
    success: boolean;
    strategy: string;
    duration: number;
    fileSize: number;
    timestamp: string;
  }>>([]);
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>({
    type: 'wifi',
    quality: 'good',
    isMetered: false,
    bandwidth: 50,
    latency: 20
  });

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      await uploadService.initialize({
        baseUrl: 'https://api.somni.test',
        defaultChunkSize: 512 * 1024, // 512KB for testing
        maxRetries: 2,
        timeoutMs: 15000
      });
      setIsInitialized(true);
      uploadService.setNetworkCondition(networkCondition);
      console.log('✅ Upload service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize upload service:', error);
      Alert.alert('Initialization Error', 'Failed to initialize upload service');
    }
  };

  const simulateUpload = async (fileSize: number, strategy: 'small' | 'medium' | 'large') => {
    if (!isInitialized) {
      Alert.alert('Error', 'Upload service not initialized');
      return;
    }

    const uploadId = `test_${Date.now()}`;
    const sessionId = `session_${Date.now()}`;
    const mockAudioUri = `file://mock_audio_${uploadId}.wav`;

    try {
      setCurrentUpload({
        id: uploadId,
        progress: { loaded: 0, total: fileSize, percentage: 0 },
        strategy
      });

      const startTime = Date.now();

      const result = await uploadService.uploadFile(
        mockAudioUri,
        sessionId,
        Math.floor(Math.random() * 180) + 30, // 30-210 seconds duration
        new Date().toISOString(),
        {
          onProgress: (progress) => {
            setCurrentUpload(prev => prev ? {
              ...prev,
              progress: {
                ...progress,
                speed: progress.speed || 0,
                remainingTime: progress.remainingTime || 0
              }
            } : null);
          },
          chunkSize: strategy === 'large' ? 1024 * 1024 : // 1MB
                    strategy === 'medium' ? 512 * 1024 : // 512KB
                    256 * 1024, // 256KB
          retryAttempts: 2
        }
      );

      const duration = Date.now() - startTime;

      // Add to history
      setUploadHistory(prev => [
        {
          id: uploadId,
          success: result.success,
          strategy,
          duration,
          fileSize,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 9) // Keep last 10 entries
      ]);

      setCurrentUpload(null);

      Alert.alert(
        'Upload Complete!',
        `Strategy: ${strategy}\nDuration: ${(duration / 1000).toFixed(1)}s\nDream ID: ${result.dreamId?.substring(0, 12)}...`
      );

    } catch (error) {
      console.error('Upload failed:', error);
      setCurrentUpload(null);
      
      // Add failed upload to history
      setUploadHistory(prev => [
        {
          id: uploadId,
          success: false,
          strategy,
          duration: Date.now() - Date.now(),
          fileSize,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 9)
      ]);

      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  const testDirectUpload = () => {
    simulateUpload(800 * 1024, 'small'); // 800KB - should use direct upload
  };

  const testChunkedUpload = () => {
    simulateUpload(3 * 1024 * 1024, 'medium'); // 3MB - should use chunked upload
  };

  const testLargeUpload = () => {
    simulateUpload(8 * 1024 * 1024, 'large'); // 8MB - large chunked upload
  };

  const changeNetworkCondition = (condition: Partial<NetworkCondition>) => {
    const newCondition = { ...networkCondition, ...condition };
    setNetworkCondition(newCondition);
    uploadService.setNetworkCondition(newCondition);
    
    console.log('📶 Network condition changed:', newCondition);
    Alert.alert(
      'Network Changed',
      `Type: ${newCondition.type}\nQuality: ${newCondition.quality}\nMetered: ${newCondition.isMetered ? 'Yes' : 'No'}`
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getNetworkQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '#4ECDC4';
      case 'good': return '#2ECC71';
      case 'fair': return '#F39C12';
      case 'poor': return '#E74C3C';
      default: return '#B0B3B8';
    }
  };

  const successRate = uploadHistory.length > 0 
    ? (uploadHistory.filter(h => h.success).length / uploadHistory.length) * 100 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Service Test</Text>

      {/* Service Status */}
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Service Status</Text>
        <Text style={[styles.statusText, { color: isInitialized ? '#4ECDC4' : '#E74C3C' }]}>
          {isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
        </Text>
      </View>

      {/* Current Upload Progress */}
      {currentUpload && (
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Current Upload ({currentUpload.strategy})</Text>
          <Text style={styles.progressText}>
            Upload ID: {currentUpload.id.substring(0, 12)}...
          </Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${currentUpload.progress.percentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.progressText}>
            {currentUpload.progress.percentage.toFixed(1)}% 
            ({formatFileSize(currentUpload.progress.loaded)} / {formatFileSize(currentUpload.progress.total)})
          </Text>
          
          {currentUpload.progress.speed && (
            <Text style={styles.progressDetail}>
              Speed: {formatFileSize(currentUpload.progress.speed)}/s
            </Text>
          )}
        </View>
      )}

      {/* Network Condition */}
      <View style={styles.networkCard}>
        <Text style={styles.cardTitle}>Network Condition</Text>
        
        <View style={styles.networkStatus}>
          <Text style={styles.networkText}>
            {networkCondition.type.toUpperCase()} • 
            <Text style={{ color: getNetworkQualityColor(networkCondition.quality) }}>
              {' '}{networkCondition.quality.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.networkDetail}>
            {networkCondition.bandwidth}Mbps • {networkCondition.latency}ms
            {networkCondition.isMetered && ' • METERED'}
          </Text>
        </View>

        <Text style={styles.sectionSubtitle}>Change Network:</Text>
        <View style={styles.buttonRow}>
          <TestButton
            title="WiFi Excellent"
            onPress={() => changeNetworkCondition({ type: 'wifi', quality: 'excellent', isMetered: false, bandwidth: 100, latency: 10 })}
            variant="secondary"
          />
          
          <TestButton
            title="Cellular Good"
            onPress={() => changeNetworkCondition({ type: 'cellular', quality: 'good', isMetered: true, bandwidth: 20, latency: 50 })}
            variant="secondary"
          />
        </View>

        <View style={styles.buttonRow}>
          <TestButton
            title="WiFi Poor"
            onPress={() => changeNetworkCondition({ type: 'wifi', quality: 'poor', isMetered: false, bandwidth: 5, latency: 200 })}
            variant="secondary"
          />
          
          <TestButton
            title="Cellular Fair"
            onPress={() => changeNetworkCondition({ type: 'cellular', quality: 'fair', isMetered: true, bandwidth: 10, latency: 100 })}
            variant="secondary"
          />
        </View>
      </View>

      {/* Upload Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Strategy Tests</Text>
        
        <View style={styles.buttonRow}>
          <TestButton
            title="Direct Upload (800KB)"
            onPress={testDirectUpload}
            disabled={!isInitialized || !!currentUpload}
            variant="primary"
          />
          
          <TestButton
            title="Chunked Upload (3MB)"
            onPress={testChunkedUpload}
            disabled={!isInitialized || !!currentUpload}
            variant="primary"
          />
        </View>

        <TestButton
          title="Large Chunked Upload (8MB)"
          onPress={testLargeUpload}
          disabled={!isInitialized || !!currentUpload}
          variant="primary"
        />
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Upload Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Uploads:</Text>
          <Text style={styles.statValue}>{uploadHistory.length}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Success Rate:</Text>
          <Text style={[styles.statValue, { color: successRate > 80 ? '#4ECDC4' : successRate > 60 ? '#F39C12' : '#E74C3C' }]}>
            {successRate.toFixed(1)}%
          </Text>
        </View>

        {uploadHistory.length > 0 && (
          <>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg Duration:</Text>
              <Text style={styles.statValue}>
                {(uploadHistory.reduce((sum, h) => sum + h.duration, 0) / uploadHistory.length / 1000).toFixed(1)}s
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Strategy Distribution:</Text>
              <Text style={styles.statValue}>
                S:{uploadHistory.filter(h => h.strategy === 'small').length} 
                M:{uploadHistory.filter(h => h.strategy === 'medium').length} 
                L:{uploadHistory.filter(h => h.strategy === 'large').length}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Upload History</Text>
          
          {uploadHistory.slice(0, 5).map((historyItem, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyId}>
                  {historyItem.success ? '✅' : '❌'} {historyItem.id.substring(0, 12)}...
                </Text>
                <Text style={styles.historyStrategy}>
                  {historyItem.strategy.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.historyDetails}>
                <Text style={styles.historyDetail}>
                  {formatFileSize(historyItem.fileSize)} • {(historyItem.duration / 1000).toFixed(1)}s
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(historyItem.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Clear History */}
      {uploadHistory.length > 0 && (
        <TestButton
          title="Clear History"
          onPress={() => setUploadHistory([])}
          variant="danger"
        />
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
  statusCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
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
  networkCard: {
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  networkStatus: {
    marginBottom: 15,
  },
  networkText: {
    fontSize: 16,
    color: '#EAEAEA',
    fontWeight: '600',
    marginBottom: 4,
  },
  networkDetail: {
    fontSize: 12,
    color: '#B0B3B8',
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#EAEAEA',
    marginBottom: 10,
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#EAEAEA',
  },
  statValue: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  historyItem: {
    backgroundColor: '#0F3460',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyId: {
    fontSize: 12,
    color: '#B0B3B8',
    fontWeight: '600',
  },
  historyStrategy: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDetail: {
    fontSize: 12,
    color: '#EAEAEA',
  },
  historyTime: {
    fontSize: 11,
    color: '#B0B3B8',
  },
});