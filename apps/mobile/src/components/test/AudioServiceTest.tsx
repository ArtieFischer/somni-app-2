import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useAudioRecorderService, AudioRecordingResult } from '../../hooks/useAudioRecorder';

// Simple Button component for testing
const TestButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
}> = ({ title, onPress, variant = 'primary', disabled = false }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'danger' ? styles.dangerButton : styles.primaryButton,
      disabled && styles.disabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export const AudioServiceTest: React.FC = () => {
  const [lastRecording, setLastRecording] = useState<AudioRecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cleanup
  } = useAudioRecorderService();

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();
      setLastRecording(result);
      Alert.alert(
        'Recording Complete',
        `Duration: ${result.duration}s\nSize: ${Math.round(result.fileSize / 1024)}KB\nFormat: ${result.format}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Service Test</Text>
      
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isRecording ? 'Recording' : 'Ready'}
        </Text>
        {isRecording && (
          <Text style={styles.duration}>{formatTime(recordingDuration)}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TestButton
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
          variant={isRecording ? 'danger' : 'primary'}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
        />
      </View>

      {lastRecording && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Last Recording:</Text>
          <Text style={styles.resultText}>Duration: {lastRecording.duration}s</Text>
          <Text style={styles.resultText}>Size: {Math.round(lastRecording.fileSize / 1024)}KB</Text>
          <Text style={styles.resultText}>Format: {lastRecording.format}</Text>
          <Text style={styles.resultUri} numberOfLines={2}>URI: {lastRecording.uri}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#1A1A2E'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#EAEAEA'
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  statusText: {
    fontSize: 16,
    color: '#EAEAEA'
  },
  duration: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#4ECDC4'
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#4ECDC4'
  },
  dangerButton: {
    backgroundColor: '#FF6B6B'
  },
  disabled: {
    opacity: 0.6
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  resultContainer: {
    backgroundColor: '#16213E',
    padding: 15,
    borderRadius: 8
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 10
  },
  resultText: {
    fontSize: 16,
    color: '#EAEAEA',
    marginBottom: 5
  },
  resultUri: {
    fontSize: 12,
    color: '#B0B3B8',
    marginTop: 5
  }
});