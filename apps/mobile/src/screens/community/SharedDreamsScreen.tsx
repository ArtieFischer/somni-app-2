import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Box,
  Text,
  Pressable,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { dreamSharingService, PublicSharedDream } from '../../services/dreamSharingService';
import { Card } from '../../components/atoms';

export const SharedDreamsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dreams, setDreams] = useState<PublicSharedDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalDreams, setTotalDreams] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
      setOffset(0);
    } else if (offset === 0) {
      setIsLoading(true);
    }

    try {
      const response = await dreamSharingService.getPublicSharedDreams(
        LIMIT,
        refresh ? 0 : offset
      );

      if (response.success) {
        if (refresh || offset === 0) {
          setDreams(response.dreams);
        } else {
          setDreams(prev => [...prev, ...response.dreams]);
        }
        setTotalDreams(response.total);
        setOffset(prev => prev + response.dreams.length);
      }
    } catch (error) {
      console.error('Error loading shared dreams:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && dreams.length < totalDreams) {
      setIsLoadingMore(true);
      loadDreams();
    }
  };

  const renderDreamCard = ({ item }: { item: PublicSharedDream }) => (
    <Card
      variant="elevated"
      marginHorizontal={0}
      style={{ marginBottom: 12 }}
    >
      <VStack space="md">
        <HStack style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <VStack style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: darkTheme.colors.text.primary,
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {item.dream_title || 'Untitled Dream'}
            </Text>
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <Ionicons
                name={item.is_anonymous ? 'eye-off' : 'person'}
                size={14}
                color={darkTheme.colors.text.secondary}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: darkTheme.colors.text.secondary,
                }}
              >
                {item.is_anonymous ? 'Anonymous' : item.display_name || 'Shared Dream'}
              </Text>
              <Text style={{ color: darkTheme.colors.text.secondary }}>•</Text>
              <Text
                style={{
                  fontSize: 14,
                  color: darkTheme.colors.text.secondary,
                }}
              >
                {format(new Date(item.shared_at), 'MMM d')}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {item.dream_transcript && (
          <Text
            style={{
              fontSize: 15,
              color: darkTheme.colors.text.primary,
              lineHeight: 22,
            }}
            numberOfLines={3}
          >
            {item.dream_transcript}
          </Text>
        )}

        <HStack space="lg" style={{ marginTop: 8 }}>
          {item.mood !== null && (
            <HStack space="xs" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="emoticon-outline"
                size={16}
                color={darkTheme.colors.secondary}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: darkTheme.colors.text.secondary,
                }}
              >
                Mood: {item.mood}/5
              </Text>
            </HStack>
          )}
          {item.clarity !== null && (
            <HStack space="xs" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={16}
                color={darkTheme.colors.secondary}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: darkTheme.colors.text.secondary,
                }}
              >
                Clarity: {item.clarity}%
              </Text>
            </HStack>
          )}
        </HStack>

        {item.themes && item.themes.length > 0 && (
          <HStack space="sm" style={{ flexWrap: 'wrap', marginTop: 8 }}>
            {item.themes.map((theme, index) => (
              <Box
                key={index}
                style={{
                  backgroundColor: `${darkTheme.colors.primary}20`,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.primary,
                    fontWeight: '500',
                  }}
                >
                  {theme.label}
                </Text>
              </Box>
            ))}
          </HStack>
        )}
      </VStack>
    </Card>
  );

  const renderEmpty = () => (
    <Box
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
      }}
    >
      <MaterialCommunityIcons
        name="cloud-outline"
        size={64}
        color={darkTheme.colors.border.secondary}
      />
      <Text
        style={{
          fontSize: 18,
          color: darkTheme.colors.text.secondary,
          marginTop: 16,
          fontWeight: '500',
        }}
      >
        No shared dreams yet
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: darkTheme.colors.text.secondary,
          marginTop: 8,
          textAlign: 'center',
          paddingHorizontal: 40,
        }}
      >
        Be the first to share your dreams with the Somni community!
      </Text>
    </Box>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <Box style={{ paddingVertical: 20 }}>
        <ActivityIndicator color={darkTheme.colors.primary} />
      </Box>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: darkTheme.colors.background.primary }}
    >
      <VStack style={{ flex: 1 }}>
        <HStack
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: darkTheme.colors.border.primary,
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 16 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={darkTheme.colors.text.primary}
            />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: darkTheme.colors.text.primary,
              flex: 1,
            }}
          >
            Community Dreams
          </Text>
        </HStack>

        {isLoading ? (
          <Box
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={darkTheme.colors.primary} />
          </Box>
        ) : (
          <FlatList
            data={dreams}
            renderItem={renderDreamCard}
            keyExtractor={item => item.share_id}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 40,
            }}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadDreams(true)}
                tintColor={darkTheme.colors.primary}
              />
            }
          />
        )}
      </VStack>
    </SafeAreaView>
  );
};