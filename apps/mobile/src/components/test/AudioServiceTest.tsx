import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { AudioService, AudioRecordingResult } from '../../infrastructure/services/AudioService';

export const AudioServiceTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [lastRecording, setLastRecording] = useState<AudioRecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioServiceRef = useRef<AudioService | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioServiceRef.current = new AudioService();
    audioServiceRef.current.initialize();

    return () => {
      audioServiceRef.current?.cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      await audioServiceRef.current?.startRecording();
      setIsRecording(true);

      // Update duration every second
      timerRef.current = setInterval(() => {
        const currentDuration = audioServiceRef.current?.getCurrentDuration() || 0;
        setDuration(currentDuration);
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioServiceRef.current?.stopRecording();
      if (result) {
        setLastRecording(result);
        Alert.alert(
          'Recording Complete',
          `Duration: ${result.duration}s\nSize: ${Math.round(result.fileSize / 1024)}KB\nFormat: ${result.format}`
        );
      }
      setIsRecording(false);
      setDuration(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
      <Text variant="h1" style={styles.title}>Audio Service Test</Text>
      
      {error && (
        <Text variant="body" style={styles.error}>{error}</Text>
      )}

      <View style={styles.statusContainer}>
        <Text variant="body">Status: {isRecording ? 'Recording' : 'Ready'}</Text>
        {isRecording && (
          <Text variant="body" style={styles.duration}>{formatTime(duration)}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant={isRecording ? 'secondary' : 'primary'}
          onPress={isRecording ? stopRecording : startRecording}
          style={styles.button}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </View>

      {lastRecording && (
        <View style={styles.resultContainer}>
          <Text variant="h3">Last Recording:</Text>
          <Text variant="body">Duration: {lastRecording.duration}s</Text>
          <Text variant="body">Size: {Math.round(lastRecording.fileSize / 1024)}KB</Text>
          <Text variant="body">Format: {lastRecording.format}</Text>
          <Text variant="caption">URI: {lastRecording.uri}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    marginBottom: 30
  },
  error: {
    color: 'red',
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
    marginTop: 10
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  button: {
    minWidth: 200
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8
  }
});