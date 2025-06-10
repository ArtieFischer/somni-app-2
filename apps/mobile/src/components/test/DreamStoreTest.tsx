import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDreamStore } from '@somni/stores';
import { DreamDTO } from '@somni/types';

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

export const DreamStoreTest: React.FC = () => {
  const dreamStore = useDreamStore();
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Mock recording session with timer
  const startMockRecording = () => {
    dreamStore.startRecording();
    setSessionTimer(0);
    
    const interval = setInterval(() => {
      setSessionTimer(prev => {
        const newTime = prev + 1;
        // Update session duration in real-time
        dreamStore.updateRecordingSession({ duration: newTime });
        return newTime;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopMockRecording = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    dreamStore.stopRecording();
    
    // Create a mock dream after recording
    setTimeout(() => {
      addMockDream();
      dreamStore.clearRecordingSession();
    }, 1000);
  };

  const addMockDream = () => {
    const mockDream: DreamDTO = {
      userId: 'test-user-123',
      rawTranscript: `Mock dream recorded at ${new Date().toLocaleTimeString()}. I was flying over a beautiful landscape with purple clouds and golden mountains.`,
      duration: sessionTimer,
      confidence: 0.85 + Math.random() * 0.15,
      wasEdited: false,
      recordedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'completed',
      fileSize: Math.floor(Math.random() * 1000000) + 500000,
      tags: ['flying', 'landscape', 'adventure'],
      emotions: ['wonder', 'freedom', 'joy']
    };

    const dream = dreamStore.addDream(mockDream);
    
    Alert.alert(
      'Dream Added!',
      `Created dream: ${dream.id.substring(0, 12)}...\nDuration: ${dream.duration}s\nConfidence: ${Math.round(dream.confidence * 100)}%`
    );
  };

  const addRandomDream = () => {
    const mockTranscripts = [
      "I was swimming in an ocean of stars, each one singing a different melody.",
      "Found myself in a library where books flew around like birds, reading themselves aloud.",
      "Walking through a forest where the trees were made of crystal and rang like bells in the wind.",
      "Riding a train that traveled through different seasons, each car was a different time of year.",
      "In a city where buildings grew like plants, reaching toward a purple sky.",
      "Dancing with my shadow under a moon that changed colors every few seconds."
    ];

    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    const randomDuration = Math.floor(Math.random() * 180) + 30; // 30-210 seconds
    
    const mockDream: DreamDTO = {
      userId: 'test-user-123',
      rawTranscript: randomTranscript,
      duration: randomDuration,
      confidence: 0.7 + Math.random() * 0.3,
      wasEdited: Math.random() > 0.7,
      recordedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random within last week
      createdAt: new Date().toISOString(),
      status: Math.random() > 0.8 ? 'pending' : 'completed',
      fileSize: Math.floor(Math.random() * 2000000) + 300000,
      tags: ['random', 'test'],
      emotions: ['curiosity', 'surprise']
    };

    dreamStore.addDream(mockDream);
  };

  const searchDreams = () => {
    const results = dreamStore.searchDreams('flying');
    Alert.alert(
      'Search Results',
      `Found ${results.length} dreams containing "flying"`
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const stats = dreamStore.getDreamStats();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dream Store Test</Text>

      {/* Recording Session Status */}
      <View style={styles.sessionCard}>
        <Text style={styles.cardTitle}>Recording Session</Text>
        
        {dreamStore.recordingSession ? (
          <View>
            <Text style={styles.sessionText}>
              Status: {dreamStore.recordingSession.status}
            </Text>
            <Text style={styles.sessionText}>
              ID: {dreamStore.recordingSession.id.substring(0, 12)}...
            </Text>
            {dreamStore.isRecording && (
              <Text style={styles.timerText}>
                Duration: {formatTime(sessionTimer)}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.sessionText}>No active session</Text>
        )}

        <View style={styles.buttonRow}>
          <TestButton
            title={dreamStore.isRecording ? 'Stop Recording' : 'Start Recording'}
            variant={dreamStore.isRecording ? 'danger' : 'primary'}
            onPress={dreamStore.isRecording ? stopMockRecording : startMockRecording}
          />
        </View>
      </View>

      {/* Dream Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dream Management</Text>
        
        <View style={styles.buttonRow}>
          <TestButton
            title="Add Random Dream"
            onPress={addRandomDream}
            variant="secondary"
          />
          
          <TestButton
            title="Search Dreams"
            onPress={searchDreams}
            variant="secondary"
          />
        </View>

        <TestButton
          title="Clear All Dreams"
          onPress={() => {
            Alert.alert(
              'Clear All Dreams',
              'Are you sure? This will delete all stored dreams.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: dreamStore.clearAllData }
              ]
            );
          }}
          variant="danger"
        />
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Dreams:</Text>
          <Text style={styles.statValue}>{stats.totalDreams}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Duration:</Text>
          <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Average Duration:</Text>
          <Text style={styles.statValue}>{formatDuration(Math.round(stats.averageDuration))}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Completed:</Text>
          <Text style={styles.statValue}>{stats.completedDreams}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Pending:</Text>
          <Text style={styles.statValue}>{stats.pendingDreams}</Text>
        </View>

        {dreamStore.lastRecordingDate && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Recording:</Text>
            <Text style={styles.statValue}>
              {new Date(dreamStore.lastRecordingDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Dreams List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Dreams ({dreamStore.dreams.length})</Text>
        
        {dreamStore.dreams.slice(0, 3).map((dream, index) => (
          <View key={dream.id} style={styles.dreamCard}>
            <View style={styles.dreamHeader}>
              <Text style={styles.dreamId}>#{index + 1}</Text>
              <Text style={[styles.dreamStatus, { 
                color: dream.status === 'completed' ? '#4ECDC4' : 
                       dream.status === 'pending' ? '#F39C12' : '#E74C3C' 
              }]}>
                {dream.status}
              </Text>
            </View>
            
            <Text style={styles.dreamText} numberOfLines={2}>
              {dream.rawTranscript}
            </Text>
            
            <View style={styles.dreamFooter}>
              <Text style={styles.dreamDetail}>
                {formatDuration(dream.duration)} • {Math.round(dream.confidence * 100)}% confidence
              </Text>
              <Text style={styles.dreamDetail}>
                {new Date(dream.recordedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        {dreamStore.dreams.length === 0 && (
          <Text style={styles.emptyText}>
            No dreams yet. Start recording or add a random dream!
          </Text>
        )}
      </View>

      {/* Error Display */}
      {dreamStore.error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{dreamStore.error}</Text>
          <TestButton
            title="Clear Error"
            onPress={dreamStore.clearError}
            variant="secondary"
          />
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
  sessionCard: {
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
  sessionText: {
    fontSize: 14,
    color: '#EAEAEA',
    marginBottom: 5,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
    marginTop: 10,
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
    paddingHorizontal: 20,
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
  dreamCard: {
    backgroundColor: '#0F3460',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamId: {
    fontSize: 12,
    color: '#B0B3B8',
    fontWeight: '600',
  },
  dreamStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dreamText: {
    fontSize: 14,
    color: '#EAEAEA',
    lineHeight: 20,
    marginBottom: 10,
  },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamDetail: {
    fontSize: 12,
    color: '#B0B3B8',
  },
  emptyText: {
    fontSize: 14,
    color: '#B0B3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  errorCard: {
    backgroundColor: '#2C1810',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 10,
  },
});