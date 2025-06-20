import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  FlatList, 
  RefreshControl,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Pressable,
  Center,
} from '../../../components/ui';
import { SimpleInput } from '../../../components/ui/SimpleInput';
import { Button } from '../../../components/atoms';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { Dream } from '@somni/types';
import { DreamCard } from '../../../components/molecules/DreamCard';
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '@somni/types';
import { darkTheme } from '@somni/theme';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { testRealtimeConnection } from '../../../utils/testRealtimeConnection';
import { testDatabaseRealtime } from '../../../utils/testDatabaseRealtime';
import { useIsFocused } from '@react-navigation/native';

type DreamDiaryScreenProps = MainTabScreenProps<'DreamDiary'>;

export const DreamDiaryScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const navigation = useNavigation<DreamDiaryScreenProps['navigation']>();
  const { dreams, searchDreams, updateDream, addDream } = useDreamStore();
  const { session, user } = useAuth();
  const isFocused = useIsFocused();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lucid' | 'recent'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [retryingDreams, setRetryingDreams] = useState<Set<string>>(new Set());

  // Filter and search dreams
  const filteredDreams = useMemo(() => {
    let result = dreams;

    // Apply search
    if (searchQuery) {
      const searchResult = searchDreams({ text: searchQuery });
      result = searchResult.dreams;
    }

    // Apply filter
    switch (selectedFilter) {
      case 'lucid':
        // Filter for lucid dreams (when we have that data)
        result = result.filter(dream => dream.tags?.includes('lucid'));
        break;
      case 'recent':
        // Get dreams from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(dream => 
          new Date(dream.recordedAt) >= weekAgo
        );
        break;
    }

    // Sort by most recent first
    return result.sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  }, [dreams, searchQuery, selectedFilter, searchDreams]);

  // Fetch dreams on mount (only once)
  useEffect(() => {
    if (user?.id) {
      // Only fetch on first mount, not on every re-render
      const timer = setTimeout(() => {
        onRefresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array to run only once

  // Memoize the real-time event handler
  const handleRealtimeEvent = useCallback((payload: any) => {
      console.log('🎯 DreamDiary: Realtime event:', {
        type: payload.eventType,
        dreamId: payload.new?.id || payload.old?.id,
        status: payload.new?.transcription_status,
        hasTranscript: !!payload.new?.raw_transcript,
      });

      // Handle dream updates
      if (payload.eventType === 'UPDATE' && payload.new) {
        const dreamData = payload.new;
        
        // Find existing dream in store
        const existingDream = dreams.find(d => 
          d.id === dreamData.id || 
          d.id === `temp_${dreamData.id}` ||
          d.id.replace('temp_', '') === dreamData.id
        );

        if (existingDream) {
          const newStatus = dreamData.transcription_status === 'completed' ? 'completed' : 
                           dreamData.transcription_status === 'processing' ? 'transcribing' : 
                           dreamData.transcription_status === 'failed' ? 'failed' : 'pending';
          
          console.log('📝 Updating existing dream:', {
            dreamId: existingDream.id,
            oldStatus: existingDream.status,
            newStatus,
            hasTranscript: !!dreamData.raw_transcript,
          });
          
          updateDream(existingDream.id, {
            id: dreamData.id,
            rawTranscript: dreamData.raw_transcript || existingDream.rawTranscript,
            status: newStatus,
          });
          
        }
      } else if (payload.eventType === 'INSERT' && payload.new) {
        const dreamData = payload.new;
        
        // Check if dream already exists
        const exists = dreams.some(d => 
          d.id === dreamData.id || 
          d.id === `temp_${dreamData.id}` ||
          d.id.replace('temp_', '') === dreamData.id
        );

        if (!exists) {
          console.log('➕ Adding new dream from realtime:', dreamData.id);
          addDream({
            id: dreamData.id,
            userId: dreamData.user_id || user.id, // Add the missing userId
            title: `Dream ${new Date(dreamData.created_at).toLocaleDateString()}`,
            description: dreamData.raw_transcript?.substring(0, 100) + '...' || '',
            rawTranscript: dreamData.raw_transcript || '',
            recordedAt: new Date(dreamData.created_at),
            duration: dreamData.duration || 0,
            status: dreamData.transcription_status === 'completed' ? 'completed' : 
                    dreamData.transcription_status === 'processing' ? 'transcribing' : 
                    dreamData.transcription_status === 'failed' ? 'failed' : 'pending',
            confidence: 0.8,
            createdAt: new Date(dreamData.created_at),
            updatedAt: new Date(dreamData.updated_at || dreamData.created_at),
          });
        }
      }
  }, [dreams, updateDream, addDream, user?.id, isFocused]);

  // Add a small delay before subscribing to avoid connection errors on app startup
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        setShouldSubscribe(true);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Subscribe to real-time dream updates
  useRealtimeSubscription({
    channelName: 'dream-diary',
    table: 'dreams',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    enabled: shouldSubscribe && !!user?.id,
    onEvent: handleRealtimeEvent,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    
    if (user?.id) {
      try {
        // Fetch dreams from database
        const { data: dbDreams, error } = await supabase
          .from('dreams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (!error && dbDreams) {
          console.log('🔄 Fetched dreams from database:', dbDreams.length);
          
          // Update local store with database dreams
          dbDreams.forEach(dbDream => {
            const existingDream = dreams.find(d => 
              d.id === dbDream.id || 
              d.id === `temp_${dbDream.id}` ||
              d.id.replace('temp_', '') === dbDream.id
            );
            
            if (existingDream) {
              // Update existing dream
              updateDream(existingDream.id, {
                id: dbDream.id,
                rawTranscript: dbDream.raw_transcript || existingDream.rawTranscript,
                status: dbDream.transcription_status === 'completed' ? 'completed' : 
                        dbDream.transcription_status === 'processing' ? 'transcribing' : 
                        dbDream.transcription_status === 'failed' ? 'failed' : 'pending',
              });
            } else if (dbDream.raw_transcript) {
              // Add new dream if it has a transcript
              console.log('➕ Adding dream from database:', dbDream.id);
              addDream({
                id: dbDream.id,
                userId: dbDream.user_id || user.id, // Add the missing userId
                title: `Dream ${new Date(dbDream.created_at).toLocaleDateString()}`,
                description: dbDream.raw_transcript.substring(0, 100) + '...',
                rawTranscript: dbDream.raw_transcript,
                recordedAt: new Date(dbDream.created_at),
                duration: dbDream.duration || 0,
                status: 'completed',
                confidence: 0.8,
                createdAt: new Date(dbDream.created_at),
                updatedAt: new Date(dbDream.updated_at || dbDream.created_at),
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dreams:', error);
      }
    }
    
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDreamPress = (dream: Dream) => {
    navigation.navigate('DreamDetail', { dreamId: dream.id });
  };

  const handleAnalyzePress = (dream: Dream) => {
    // Navigate to analysis screen or trigger analysis
    console.log('Analyze dream:', dream.id);
  };

  const handleDeletePress = (dream: Dream) => {
    // Delete dream from store
    const { deleteDream } = useDreamStore.getState();
    deleteDream(dream.id);
  };

  const handleRetryPress = async (dream: Dream) => {
    console.log('🔄 Retry pressed for dream:', {
      id: dream.id,
      status: dream.status,
      hasAudioUri: !!dream.audioUri,
      audioUri: dream.audioUri
    });

    if (!session?.access_token || !user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please log in to retry transcription',
        [{ text: 'OK' }]
      );
      return;
    }

    // Add to retrying set
    setRetryingDreams(prev => new Set(prev).add(dream.id));
    
    try {
      // For pending dreams with audio, we need to transcribe from the audio file
      if (dream.status === 'pending') {
        if (!dream.audioUri) {
          console.error('❌ No audio URI found for pending dream');
          throw new Error('No audio file found for this dream');
        }

        // Update dream status to transcribing
        updateDream(dream.id, { status: 'transcribing' });

        // Read the audio file if it exists
        const fileInfo = await FileSystem.getInfoAsync(dream.audioUri);
        console.log('📁 Audio file info:', fileInfo);
        
        if (!fileInfo.exists) {
          throw new Error('Audio file not found at: ' + dream.audioUri);
        }

        // Create dream in Supabase if it doesn't have a real ID
        let dreamId = dream.id;
        if (dream.id.startsWith('temp_') || dream.id.startsWith('dream_')) {
          console.log('📝 Creating dream in database...');
          const { data, error: createError } = await supabase
            .from('dreams')
            .insert({
              user_id: user.id,
              raw_transcript: 'Waiting for transcription...',
              duration: dream.duration,
              transcription_status: 'pending',
              created_at: dream.createdAt,
            })
            .select()
            .single();
          
          if (createError || !data) {
            throw new Error('Failed to create dream record');
          }

          dreamId = data.id;
          // Update local dream with the real ID
          updateDream(dream.id, { id: dreamId });
        }

        // Read the audio file as base64
        const audioBase64 = await FileSystem.readAsStringAsync(
          dream.audioUri,
          { encoding: FileSystem.EncodingType.Base64 }
        );

        // Call the transcription edge function
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dreamId: dreamId,
              audioBase64,
              duration: dream.duration
            })
          }
        );

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Transcription failed');
        }

        // Delete the local audio file after successful upload
        try {
          await FileSystem.deleteAsync(dream.audioUri);
          console.log('🗑️ Deleted local audio file');
        } catch (deleteError) {
          console.warn('Failed to delete audio file:', deleteError);
        }

        Alert.alert(
          'Transcription Started',
          'Your dream is being transcribed',
          [{ text: 'OK' }]
        );
      } else {
        // For failed dreams, use the retry endpoint
        updateDream(dream.id, { status: 'transcribing' });

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-retry`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dreamId: dream.id.replace('temp_', ''),
            })
          }
        );

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Retry failed');
        }

        Alert.alert(
          'Transcription Started',
          'Your dream is being transcribed',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Retry transcription error:', {
        error: error.message || error,
        dreamId: dream.id,
        status: dream.status,
        audioUri: dream.audioUri
      });
      // Revert status
      updateDream(dream.id, { status: dream.status === 'pending' ? 'pending' : 'failed' });
      
      const errorMessage = error.message || 'Unknown error occurred';
      Alert.alert(
        String(t('record.serviceUnavailable.title')),
        errorMessage.includes('Audio file not found') 
          ? 'The audio file for this dream could not be found. It may have been deleted.'
          : String(t('record.serviceUnavailable.message')),
        [{ text: String(t('actions.ok')) }]
      );
    } finally {
      // Remove from retrying set
      setRetryingDreams(prev => {
        const newSet = new Set(prev);
        newSet.delete(dream.id);
        return newSet;
      });
    }
  };

  const renderDreamItem = ({ item }: { item: Dream }) => (
    <DreamCard 
      dream={item}
      onPress={handleDreamPress}
      onAnalyzePress={handleAnalyzePress}
      onDeletePress={handleDeletePress}
      onRetryPress={handleRetryPress}
    />
  );

  const ListHeader = () => (
    <VStack space="lg" px="$4" pt="$3" pb="$3">
      {/* Search Bar */}
      <Box position="relative">
        <Box position="absolute" left="$3" top="50%" zIndex={1} style={{ transform: [{ translateY: -9 }] }}>
          <Ionicons name="search" size={18} color={darkTheme.colors.text.secondary} />
        </Box>
        <Box 
          bg={darkTheme.colors.background.elevated} 
          borderRadius={24}
          overflow="hidden"
        >
          <SimpleInput
            placeholder={t('journal.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="lg"
            style={{
              paddingLeft: 40,
              paddingRight: searchQuery.length > 0 ? 40 : 16,
              backgroundColor: darkTheme.colors.background.elevated,
              borderWidth: 0,
            }}
          />
        </Box>
        {searchQuery.length > 0 && (
          <Pressable 
            onPress={() => setSearchQuery('')}
            position="absolute" 
            right="$3" 
            top="50%" 
            zIndex={1} 
            style={{ transform: [{ translateY: -9 }] }}
          >
            <Ionicons name="close-circle" size={18} color={darkTheme.colors.text.secondary} />
          </Pressable>
        )}
      </Box>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
      >
        <HStack space="sm">
          {(['all', 'recent', 'lucid'] as const).map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                bg={isActive ? darkTheme.colors.primary + '20' : darkTheme.colors.background.elevated}
                borderWidth={1}
                borderColor={isActive ? darkTheme.colors.primary : 'transparent'}
                borderRadius="$full"
                px="$4"
                py="$2"
              >
                <Text 
                  size="sm" 
                  fontWeight={isActive ? '$semibold' : '$normal'}
                  color={isActive ? darkTheme.colors.primary : darkTheme.colors.text.primary}
                >
                  {t(`journal.filters.${filter}`)}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </ScrollView>

      {/* Debug Buttons - Remove this in production */}
      {__DEV__ && (
        <VStack space="sm" mb="$2">
          <HStack space="sm">
            <Pressable
              onPress={testRealtimeConnection}
              bg={darkTheme.colors.background.elevated}
              borderRadius={8}
              px="$3"
              py="$2"
              flex={1}
            >
              <Text size="sm" color={darkTheme.colors.primary} textAlign="center">
                Test WebSocket
              </Text>
            </Pressable>
            <Pressable
              onPress={() => testDatabaseRealtime(user?.id || '')}
              bg={darkTheme.colors.background.elevated}
              borderRadius={8}
              px="$3"
              py="$2"
              flex={1}
            >
              <Text size="sm" color={darkTheme.colors.primary} textAlign="center">
                Test DB Realtime
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      )}

      {/* Stats Summary */}
      <Box 
        bg={darkTheme.colors.background.elevated}
        borderRadius={12}
        p="$4"
        shadowColor={darkTheme.colors.black}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={3}
      >
        <HStack justifyContent="space-around" alignItems="center">
          <VStack alignItems="center" flex={1}>
            <Heading size="xl" color={darkTheme.colors.primary}>
              {dreams.length}
            </Heading>
            <Text size="sm" color={darkTheme.colors.text.secondary}>
              {t('journal.stats.total')}
            </Text>
          </VStack>
          
          <Box w={1} h={40} bg={darkTheme.colors.border.primary} mx="$4" />
          
          <VStack alignItems="center" flex={1}>
            <Heading size="xl" color={darkTheme.colors.primary}>
              {dreams.filter(d => d.tags?.includes('lucid')).length}
            </Heading>
            <Text size="sm" color={darkTheme.colors.text.secondary}>
              {t('journal.stats.lucid')}
            </Text>
          </VStack>
          
          <Box w={1} h={40} bg={darkTheme.colors.border.primary} mx="$4" />
          
          <VStack alignItems="center" flex={1}>
            <Heading size="xl" color={darkTheme.colors.primary}>
              {dreams.length > 0 
                ? Math.round(dreams.reduce((acc, d) => acc + d.confidence, 0) / dreams.length * 100)
                : 0}%
            </Heading>
            <Text size="sm" color={darkTheme.colors.text.secondary}>
              {t('journal.stats.avgMood')}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );

  const ListEmpty = () => (
    <Center flex={1} py="$20" px="$8">
      <VStack space="lg" alignItems="center">
        <Text fontSize={64}>💭</Text>
        <Heading size="lg" textAlign="center">
          {t('journal.empty')}
        </Heading>
        <Text size="md" color={darkTheme.colors.text.secondary} textAlign="center" lineHeight={24}>
          {t('journal.emptySubtitle')}
        </Text>
      </VStack>
    </Center>
  );

  return (
    <Box flex={1} bg={darkTheme.colors.background.primary}>
      <FlatList
        data={filteredDreams}
        renderItem={renderDreamItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: darkTheme.spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={darkTheme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <Box h={darkTheme.spacing.medium} />}
      />
    </Box>
  );
};