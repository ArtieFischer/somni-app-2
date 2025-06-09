import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { useAudioRecorderService, AudioRecordingResult } from '../../hooks/useAudioRecorder';

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
      <Text variant="heading" style={styles.title}>Audio Service Test</Text>
      
      {error && (
        <Text variant="body" style={styles.error}>{error}</Text>
      )}

      <View style={styles.statusContainer}>
        <Text variant="body">Status: {isRecording ? 'Recording' : 'Ready'}</Text>
        {isRecording && (
          <Text variant="body" style={styles.duration}>{formatTime(recordingDuration)}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={isRecording ? 'danger' : 'primary'}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          style={styles.button}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </View>

      {lastRecording && (
        <View style={styles.resultContainer}>
          <Text variant="subtitle">Last Recording:</Text>
          <Text variant="body">Duration: {lastRecording.duration}s</Text>
          <Text variant="body">Size: {Math.round(lastRecording.fileSize / 1024)}KB</Text>
          <Text variant="body">Format: {lastRecording.format}</Text>
          <Text variant="caption" numberOfLines={2}>URI: {lastRecording.uri}</Text>
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
    textAlign: 'center',
    marginBottom: 30,
    color: '#EAEAEA'
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30
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
    minWidth: 200
  },
  resultContainer: {
    backgroundColor: '#16213E',
    padding: 15,
    borderRadius: 8
  }
});