import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DreamyBackground } from '../../../components/atoms/DreamyBackground';
import { SkiaRecordButton } from '../../../components/atoms/SkiaRecordButton';

export const RecordScreenSimple: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  // Simulate amplitude changes when recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setAmplitude(Math.random() * 0.8 + 0.2);
      }, 200);
    } else {
      setAmplitude(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {/* Dreamy animated background */}
      <DreamyBackground active={isRecording} />
      
      <View style={styles.content}>
        <Text style={styles.title}>
          {isRecording ? 'Recording...' : 'Tap to Record'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <SkiaRecordButton
            isRecording={isRecording}
            onPress={() => setIsRecording(!isRecording)}
            amplitude={amplitude}
            size={220}
          />
        </View>
        
        <Text style={styles.subtitle}>
          {isRecording ? 'Tap again to stop' : 'Record your dream'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 40,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});