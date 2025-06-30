import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Pressable,
  Center,
  Spinner,
} from '../../../components/ui';
import { SimpleInput } from '../../../components/ui/SimpleInput';
import { PillButton } from '../../../components/atoms';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { Dream } from '@somni/types';
import { DreamCardWithDuration } from '../../../components/molecules/DreamCard/DreamCardWithDuration';
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '@somni/types';
import { darkTheme } from '@somni/theme';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { mapDatabaseDreamToFrontend } from '../../../utils/dreamMappers';
import { testRealtimeConnection } from '../../../utils/testRealtimeConnection';
import { testDatabaseRealtime } from '../../../utils/testDatabaseRealtime';
import { useIsFocused } from '@react-navigation/native';

type DreamDiaryScreenProps = MainTabScreenProps<'DreamDiary'>;

export const DreamDiaryScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const navigation = useNavigation<DreamDiaryScreenProps['navigation']>();
  const dreamStore = useDreamStore();
  const { dreams, searchDreams, updateDream, addDream, clearAllData } = dreamStore;
  const { session, user } = useAuth();
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'lucid'
  >('all');
  const [refreshing, setRefreshing] = useState(false);
  const [, setRetryingDreams] = useState<Set<string>>(new Set());
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isUserSwitching, setIsUserSwitching] = useState(false);

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
        result = result.filter((dream) => dream.tags?.includes('lucid'));
        break;
    }

    // Sort by most recent first
    return result.sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
  }, [dreams, searchQuery, selectedFilter, searchDreams]);

  // Fetch dreams on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      // Set loading state when user changes
      setIsUserSwitching(true);
      // Set current user ID in dream store to validate dreams
      dreamStore.setCurrentUserId(user.id);
      // Load dreams when component mounts or user changes
      console.log('📱 DreamDiary: Loading dreams for user:', user.id);
      onRefresh().finally(() => {
        setIsUserSwitching(false);
      });
    }
  }, [user?.id]); // Re-run when user ID changes

  // Refresh when screen comes into focus, but with rate limiting
  useEffect(() => {
    if (isFocused && user?.id) {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      // Only refresh if it's been more than 5 seconds since last refresh
      if (timeSinceLastRefresh > 5000) {
        console.log('🔄 Screen focused, refreshing dreams');
        onRefresh();
        setLastRefreshTime(now);
      }
    }
  }, [isFocused, user?.id]);

  // Memoize the real-time event handler
  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      console.log('🎯 DreamDiary: Realtime event:', {
        type: payload.eventType,
        dreamId: payload.new?.id || payload.old?.id,
        status: payload.new?.transcription_status,
        hasTranscript: !!payload.new?.raw_transcript,
      });

      // Handle dream updates
      if (payload.eventType === 'UPDATE' && payload.new) {
        const dreamData = payload.new;
        console.log('🔔 Realtime UPDATE:', {
          id: dreamData.id,
          hasTitle: 'title' in dreamData,
          title: dreamData.title,
          columns: Object.keys(dreamData),
        });

        // Find existing dream in store
        const existingDream = dreams.find(
          (d) =>
            d.id === dreamData.id ||
            d.id === `temp_${dreamData.id}` ||
            d.id.replace('temp_', '') === dreamData.id,
        );

        if (existingDream) {
          const mappedDream = mapDatabaseDreamToFrontend(dreamData);

          console.log('📝 Updating existing dream:', {
            dreamId: existingDream.id,
            oldStatus: existingDream.status,
            newStatus: mappedDream.status,
            hasTranscript: !!mappedDream.rawTranscript,
            hasTitle: !!mappedDream.title,
            title: mappedDream.title,
            hasImageUrl: !!mappedDream.image_url,
            imageUrl: mappedDream.image_url,
            rawPayload: dreamData,
          });

          updateDream(existingDream.id, {
            ...mappedDream,
            id: dreamData.id, // Ensure we keep the correct ID
          });
        }
      } else if (payload.eventType === 'INSERT' && payload.new) {
        // Skip INSERT events - RecordScreen handles new dreams from current session
        // Database sync handles dreams from other devices/sessions
        console.log(
          '🔇 Skipping INSERT event (handled by RecordScreen or sync):',
          payload.new.id,
        );
      }
    },
    [dreams, updateDream, addDream, user?.id, isFocused],
  );

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

  // Handle real-time dream_images events
  const handleDreamImagesEvent = useCallback(
    (payload: any) => {
      console.log('🖼️ Dream images realtime event:', payload);

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const dreamId = payload.new.dream_id;
        console.log('🖼️ Image added/updated for dream:', dreamId);

        // Refresh the dream to get the updated image
        if (dreamId && user?.id) {
          // Find the existing dream in the store first
          const existingDream = dreams.find(
            (d) =>
              d.id === dreamId ||
              d.id === `temp_${dreamId}` ||
              d.id.replace('temp_', '') === dreamId,
          );

          if (!existingDream) {
            console.log('🤔 Dream not found in store, skipping image update');
            return;
          }

          // Fetch the updated dream
          supabase
            .from('dreams')
            .select('*')
            .eq('id', dreamId)
            .single()
            .then(async ({ data: updatedDream, error }) => {
              if (!error && updatedDream) {
                // Fetch images for this dream
                const { data: dreamImages } = await supabase
                  .from('dream_images')
                  .select('*')
                  .eq('dream_id', dreamId);

                if (dreamImages) {
                  updatedDream.dream_images = dreamImages;
                }

                console.log(
                  '🖼️ Fetched updated dream with image:',
                  updatedDream,
                );
                const mappedDream = mapDatabaseDreamToFrontend(updatedDream);
                
                // Update using the existing dream's ID (might have temp_ prefix)
                updateDream(existingDream.id, {
                  ...mappedDream,
                  id: existingDream.id, // Keep the store's ID
                });
              }
            });
        }
      }
    },
    [user?.id, updateDream, dreams],
  );

  // Subscribe to real-time dream updates
  useRealtimeSubscription({
    channelName: 'dream-diary',
    table: 'dreams',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    enabled: shouldSubscribe && !!user?.id,
    onEvent: handleRealtimeEvent,
  });

  // Subscribe to real-time dream_images updates
  useRealtimeSubscription({
    channelName: 'dream-images-diary',
    table: 'dream_images',
    filter: undefined, // We'll filter by checking the dream's user_id after fetching
    enabled: shouldSubscribe && !!user?.id,
    onEvent: handleDreamImagesEvent,
  });

  const onRefresh = async () => {
    setRefreshing(true);

    if (user?.id) {
      try {
        // Also check the session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('🔐 Current user:', {
          userId: user.id,
          email: user.email,
          sessionUserId: session?.user?.id,
          hasSession: !!session,
          sessionMatches: session?.user?.id === user.id,
        });

        // Fetch dreams from database
        const { data: dbDreams, error } = await supabase
          .from('dreams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        // Fetch dream images separately
        if (dbDreams && dbDreams.length > 0) {
          const dreamIds = dbDreams.map((d) => d.id);
          console.log('🔍 Fetching images for dreams:', dreamIds);

          // List which dreams should have images
          const dreamsWithImagesIds = [
            '603ac37a-d2c9-418b-9d14-4d6c0b39fc57',
            '4d800e6f-fc48-43f1-8055-25585fa1e345',
            '64f09c8a-9613-41a6-9e43-750e3a763e74',
            '30393f96-3b33-46b2-93b4-d89d76b28691',
          ];
          const dreamsWithImagesInCurrentList = dreamIds.filter((id) =>
            dreamsWithImagesIds.includes(id),
          );

          console.log('📋 Dreams that should have images:', {
            totalDreamsInList: dreamIds.length,
            expectedDreamsWithImages: dreamsWithImagesIds,
            foundInCurrentList: dreamsWithImagesInCurrentList,
            foundCount: dreamsWithImagesInCurrentList.length,
          });

          const { data: dreamImages, error: imagesError } = await supabase
            .from('dream_images')
            .select('*')
            .in('dream_id', dreamIds);

          if (dreamImages && !imagesError) {
            console.log('🖼️ Fetched dream images separately:', {
              count: dreamImages.length,
              images: dreamImages,
              dreamIds: dreamIds,
            });

            // Attach images to dreams
            dbDreams.forEach((dream) => {
              const imagesForDream = dreamImages.filter(
                (img) => img.dream_id === dream.id,
              );
              dream.dream_images = imagesForDream;

              if (imagesForDream.length > 0) {
                console.log('📎 Attached images to dream:', {
                  dreamId: dream.id,
                  imageCount: imagesForDream.length,
                  images: imagesForDream,
                });
              }
            });
          } else if (imagesError) {
            console.error('❌ Error fetching dream images:', imagesError);
          }
        }

        if (!error && dbDreams) {
          console.log('🔄 Fetched dreams from database:', dbDreams.length);
          if (dbDreams.length > 0) {
            console.log('📊 First dream data:', {
              id: dbDreams[0].id,
              hasTitle: 'title' in dbDreams[0],
              title: dbDreams[0].title,
              hasImageUrl: 'image_url' in dbDreams[0],
              image_url: dbDreams[0].image_url,
              hasDreamImages: 'dream_images' in dbDreams[0],
              dream_images: dbDreams[0].dream_images,
              columns: Object.keys(dbDreams[0]),
            });

            // Log the raw response to see the exact structure
            console.log(
              '🔍 Raw first dream from DB:',
              JSON.stringify(dbDreams[0], null, 2),
            );
          }

          // Log dreams with images
          const dreamsWithImages = dbDreams.filter(
            (d) => d.image_url || (d.dream_images && d.dream_images.length > 0),
          );
          if (dreamsWithImages.length > 0) {
            console.log(
              '🖼️ Dreams with images:',
              dreamsWithImages.map((d) => ({
                id: d.id,
                image_url: d.image_url,
                dream_images: d.dream_images,
              })),
            );
          }

          // Update local store with database dreams
          dbDreams.forEach((dbDream) => {
            // console.log('🔍 Processing dream:', {
            //   id: dbDream.id,
            //   hasDreamImages: !!dbDream.dream_images,
            //   dreamImagesCount: dbDream.dream_images?.length || 0,
            //   dreamImages: dbDream.dream_images
            // });
            const existingDream = dreams.find(
              (d) =>
                d.id === dbDream.id ||
                d.id === `temp_${dbDream.id}` ||
                d.id.replace('temp_', '') === dbDream.id,
            );

            if (existingDream) {
              // Update existing dream if status/content/image has changed
              const mappedDream = mapDatabaseDreamToFrontend(dbDream);
              const hasImageUpdate =
                mappedDream.image_url !== existingDream.image_url;

              // Always update if there's new data
              if (
                existingDream.transcription_status !==
                  dbDream.transcription_status ||
                existingDream.raw_transcript !== dbDream.raw_transcript ||
                hasImageUpdate ||
                dbDream.dream_images?.length > 0 // Always update if we have images
              ) {
                console.log('🔄 Updating existing dream:', {
                  id: dbDream.id,
                  hasImageUpdate,
                  oldImageUrl: existingDream.image_url,
                  newImageUrl: mappedDream.image_url,
                  dreamImagesCount: dbDream.dream_images?.length || 0,
                });
                updateDream(existingDream.id, {
                  ...mappedDream,
                  id: existingDream.id, // Keep the store's ID format
                });
              }
            } else {
              // Check if there's a temporary dream that should be replaced
              const tempDream = dreams.find(
                (d) =>
                  d.id.startsWith('temp_') &&
                  d.transcription_status === 'pending' &&
                  Math.abs(
                    new Date(d.created_at).getTime() -
                      new Date(dbDream.created_at).getTime(),
                  ) < 60000, // Within 1 minute
              );

              if (tempDream) {
                console.log('🔄 Replacing temp dream with database dream:', {
                  tempId: tempDream.id,
                  realId: dbDream.id,
                });
                // Delete temp dream first
                const { deleteDream } = useDreamStore.getState();
                deleteDream(tempDream.id);
              }

              // Always add new dreams from database (they might be from other devices)
              console.log('➕ Adding dream from database:', dbDream.id);
              const mappedDream = mapDatabaseDreamToFrontend(dbDream);

              addDream({
                ...mappedDream,
                userId: dbDream.user_id || user.id, // Ensure userId is set
                description:
                  mappedDream.rawTranscript?.substring(0, 100) + '...' || '',
              } as any);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dreams:', error);
      }
    }

    setLastRefreshTime(Date.now());
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDreamPress = (dream: Dream) => {
    // Only navigate to dream details if transcription is complete
    const isTranscriptionReady = 
      dream.transcription_status === 'completed' || 
      dream.status === 'completed' ||
      (dream.raw_transcript && 
       dream.raw_transcript !== 'Waiting for transcription...' &&
       dream.raw_transcript !== '');
    
    if (isTranscriptionReady) {
      navigation.navigate('DreamDetail', { dreamId: dream.id });
    }
  };

  const handleAnalyzePress = (dream: Dream) => {
    navigation.navigate('DreamDetail', { dreamId: dream.id });
  };

  const handleDeletePress = async (dream: Dream) => {
    if (!user?.id) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    try {
      // Delete from database first
      const { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', dream.id)
        .eq('user_id', user.id); // Ensure user can only delete their own dreams

      if (error) {
        console.error('Failed to delete dream from database:', error);
        Alert.alert('Error', 'Failed to delete dream from database');
        return;
      }

      // Delete from local store
      const { deleteDream } = useDreamStore.getState();
      deleteDream(dream.id);

      console.log('✅ Dream deleted successfully:', dream.id);
    } catch (error) {
      console.error('Delete dream error:', error);
      Alert.alert('Error', 'Failed to delete dream');
    }
  };

  const handleRetryPress = async (dream: Dream) => {
    console.log('🔄 Retry pressed for dream:', {
      id: dream.id,
      status: dream.status,
      transcriptionStatus:
        dream.transcription_status || dream.transcriptionStatus,
      metadata: dream.transcription_metadata || dream.transcriptionMetadata,
      duration: dream.duration,
      hasAudioUri: !!dream.audioUri,
      audioUri: dream.audioUri,
    });

    if (!session?.access_token || !user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please log in to retry transcription',
        [{ text: 'OK' }],
      );
      return;
    }

    // Add to retrying set
    setRetryingDreams((prev) => new Set(prev).add(dream.id));

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
        const audioBase64 = await FileSystem.readAsStringAsync(dream.audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Call the transcription edge function
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-init`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dreamId: dreamId,
              audioBase64,
              duration: dream.duration || 0,
            }),
          },
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.message ||
              responseData.error ||
              'Transcription failed',
          );
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
          [{ text: 'OK' }],
        );
      } else {
        // For failed dreams, use the retry endpoint
        updateDream(dream.id, { status: 'transcribing' });

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dreams-transcribe-retry`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dreamId: dream.id.replace('temp_', ''),
            }),
          },
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || 'Retry failed');
        }

        Alert.alert(
          'Transcription Started',
          'Your dream is being transcribed',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Retry transcription error:', {
        error: error.message || error,
        dreamId: dream.id,
        status: dream.status,
        audioUri: dream.audioUri,
      });
      // Revert status
      updateDream(dream.id, {
        status: dream.status === 'pending' ? 'pending' : 'failed',
      });

      const errorMessage = error.message || 'Unknown error occurred';

      // If it's a "too short" error, fetch the updated dream from database
      if (errorMessage.includes('Recording too short')) {
        console.log('🔄 Fetching updated dream after too-short error');
        const { data: updatedDream, error: fetchError } = await supabase
          .from('dreams')
          .select('*')
          .eq('id', dream.id)
          .single();

        if (!fetchError && updatedDream) {
          console.log(
            '✅ Got updated dream with metadata:',
            updatedDream.transcription_metadata,
          );
          const mappedDream = mapDatabaseDreamToFrontend(updatedDream);
          updateDream(dream.id, mappedDream);
        }
      }

      Alert.alert(
        String(t('record.serviceUnavailable.title')),
        errorMessage.includes('Audio file not found')
          ? 'The audio file for this dream could not be found. It may have been deleted.'
          : errorMessage.includes('Recording too short')
            ? 'Recording must be at least 5 seconds long'
            : String(t('record.serviceUnavailable.message')),
        [{ text: String(t('actions.ok')) }],
      );
    } finally {
      // Remove from retrying set
      setRetryingDreams((prev) => {
        const newSet = new Set(prev);
        newSet.delete(dream.id);
        return newSet;
      });
    }
  };

  // Duration is now fetched individually by each DreamCardWithDuration

  const renderDreamItem = ({ item }: { item: Dream }) => (
    <DreamCardWithDuration
      dream={item}
      onPress={handleDreamPress}
      onAnalyzePress={handleAnalyzePress}
      onDeletePress={handleDeletePress}
      onRetryPress={handleRetryPress}
    />
  );

  const ListHeader = () => (
    <VStack space="lg" px="$4" pt="$3" pb="$3">
      <Box position="relative">
        <Box
          position="absolute"
          left="$3"
          top="50%"
          zIndex={1}
          style={{ transform: [{ translateY: -9 }] }}
        >
          <Ionicons
            name="search"
            size={18}
            color={darkTheme.colors.text.secondary}
          />
        </Box>
        <Box
          bg={darkTheme.colors.background.elevated}
          borderRadius={24}
          overflow="hidden"
        >
          <SimpleInput
            placeholder={t('journal.search') as string}
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
            <Ionicons
              name="close-circle"
              size={18}
              color={darkTheme.colors.text.secondary}
            />
          </Pressable>
        )}
      </Box>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space="sm">
          <PillButton
            key="all"
            label={`${String(t('journal.filters.all'))} (${dreams.length})`}
            isActive={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <Box opacity={0.5}>
            <PillButton
              key="lucid"
              label={String(t('journal.filters.lucid'))}
              isActive={false}
              onPress={() => {}}
            />
          </Box>
        </HStack>
      </ScrollView>

    </VStack>
  );

  const ListEmpty = () => (
    <Center flex={1} py="$20" px="$8">
      <VStack space="lg" alignItems="center">
        <Text fontSize={64}>💭</Text>
        <Heading size="lg" textAlign="center">
          {t('journal.empty') as string}
        </Heading>
        <Text
          size="md"
          color={darkTheme.colors.text.secondary}
          textAlign="center"
          lineHeight={24}
        >
          {t('journal.emptySubtitle') as string}
        </Text>
      </VStack>
    </Center>
  );

  return (
    <Box flex={1} bg={darkTheme.colors.background.primary}>
      {isUserSwitching ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color={darkTheme.colors.primary} />
          <Text mt="$3" color={darkTheme.colors.text.primary}>
            Loading your dreams...
          </Text>
        </Box>
      ) : (
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
      )}
    </Box>
  );
};
