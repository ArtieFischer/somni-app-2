// apps/mobile/src/screens/main/RecordScreen/RecordScreen.tsx

// Add state to track if recording was accepted
const [pendingRecording, setPendingRecording] = useState<{
  sessionId: string;
  audioUri: string;
  duration: number;
  fileSize: number;
} | null>(null);

// Modify handleRecordPress
const handleRecordPress = async () => {
  if (isButtonDisabled || isProcessing) {
    return;
  }

  setIsButtonDisabled(true);
  
  try {
    if (isRecording) {
      const result = await stopRecording();
      
      // Instead of showing success immediately, save the recording info
      if (result && dreamStore.recordingSession) {
        setPendingRecording({
          sessionId: dreamStore.recordingSession.id,
          audioUri: result.audioUri,
          duration: result.duration,
          fileSize: result.fileSize
        });
      }
    } else {
      setPendingRecording(null); // Clear any pending recording
      await startRecording();
    }
  } catch (err) {
    console.error('Record button error:', err);
  } finally {
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 500);
  }
};

// Add accept handler
const handleAcceptRecording = async () => {
  if (!pendingRecording || !dreamStore.recordingSession?.dreamId) {
    console.error('No pending recording to accept');
    return;
  }

  try {
    setIsProcessing(true);
    
    // Read the audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(
      pendingRecording.audioUri,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    console.log('📤 Sending to transcription service...');

    // Call your edge function
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.auth.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dreamStore.recordingSession.dreamId,
          audioBase64,
          duration: pendingRecording.duration
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transcription failed');
    }

    // Now add to offline queue for cleanup
    offlineQueue.addRecording({
      ...pendingRecording,
      recordedAt: new Date().toISOString()
    });

    // Clear pending recording
    setPendingRecording(null);
    
    Alert.alert(
      String(t('notifications.dreamCaptured.title')),
      'Your dream is being transcribed!',
      [{ text: String(t('actions.ok')) }]
    );

  } catch (error) {
    console.error('Transcription error:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to start transcription',
      [{ text: 'OK' }]
    );
  } finally {
    setIsProcessing(false);
  }
};

// Add cancel handler
const handleCancelRecording = async () => {
  if (pendingRecording) {
    // Delete the audio file
    try {
      await FileSystem.deleteAsync(pendingRecording.audioUri);
    } catch (error) {
      console.error('Failed to delete audio file:', error);
    }
    
    setPendingRecording(null);
    dreamStore.clearRecordingSession();
  }
};

// Update the render to show accept/cancel buttons
return (
  <SafeAreaView style={styles.container}>
    <View style={styles.innerContainer}>
      <OfflineQueueStatus />

      <Animated.View style={[styles.content, /* ... */]}>
        {/* ... existing content ... */}

        {/* Main recording button */}
        <View style={styles.buttonSection}>
          {!pendingRecording ? (
            <MorphingRecordButton
              isRecording={isRecording}
              onPress={handleRecordPress}
              amplitude={amplitude}
            />
          ) : (
            <View style={styles.actionButtons}>
              <Button
                variant="primary"
                size="large"
                onPress={handleAcceptRecording}
                loading={isProcessing}
                style={styles.acceptButton}
              >
                Accept Recording
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onPress={handleCancelRecording}
                disabled={isProcessing}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          )}
        </View>

        {/* ... rest of the component ... */}
      </Animated.View>
    </View>
  </SafeAreaView>
);