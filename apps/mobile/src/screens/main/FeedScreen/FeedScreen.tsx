import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/atoms';
import { ThemeFilter } from '../../../components/molecules/ThemeFilter/ThemeFilter';
import { FeedItem } from '../../../components/molecules/FeedItem/FeedItem';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './FeedScreen.styles';
import { dreamSharingService, PublicSharedDream } from '../../../services/dreamSharingService';
import { Box } from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const FeedScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const styles = useStyles();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [dreams, setDreams] = useState<PublicSharedDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalDreams, setTotalDreams] = useState(0);
  const [offset, setOffset] = useState(0);
  const [themes, setThemes] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const LIMIT = 20;

  // Load dreams on mount
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
        console.log('Loaded dreams:', response.dreams.length, 'Total:', response.total);
        if (refresh || offset === 0) {
          setDreams(response.dreams);
          // Extract unique themes from dreams
          extractThemes(response.dreams);
        } else {
          setDreams(prev => [...prev, ...response.dreams]);
          // Update themes with new dreams
          extractThemes([...dreams, ...response.dreams]);
        }
        setTotalDreams(response.total);
        setOffset(prev => prev + response.dreams.length);
      } else {
        console.log('Failed to load dreams:', response.error);
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

  // Extract unique themes from dreams
  const extractThemes = (dreamsList: PublicSharedDream[]) => {
    const themeMap = new Map<string, number>();
    
    dreamsList.forEach(dream => {
      dream.themes?.forEach(theme => {
        const count = themeMap.get(theme.code) || 0;
        themeMap.set(theme.code, count + 1);
      });
    });

    const extractedThemes = Array.from(themeMap.entries())
      .map(([code, count]) => {
        const dreamTheme = dreamsList
          .flatMap(d => d.themes || [])
          .find(t => t.code === code);
        return {
          id: code,
          name: dreamTheme?.label || code,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 themes

    setThemes(extractedThemes);
  };

  // Filter dreams based on selected theme
  const filteredDreams = useMemo(() => {
    if (!selectedTheme) return dreams;
    return dreams.filter(dream => 
      dream.themes?.some(theme => theme.code === selectedTheme)
    );
  }, [selectedTheme, dreams]);

  const handleLike = (dreamId: string) => {
    console.log('Liked dream:', dreamId);
    // In real app, this would update the backend
  };

  const renderHeader = () => (
    <>
      {themes.length > 0 && (
        <ThemeFilter
          themes={themes}
          selectedTheme={selectedTheme}
          onThemeSelect={setSelectedTheme}
        />
      )}
    </>
  );

  const renderItem = ({ item }: { item: PublicSharedDream }) => {
    // Transform PublicSharedDream to FeedItem format
    const feedItemData = {
      id: item.share_id,
      username: item.is_anonymous ? undefined : (item.display_name || 'Shared Dream'),
      isAnonymous: item.is_anonymous,
      date: new Date(item.shared_at),
      transcription: item.dream_transcript || '',
      themes: item.themes?.map(t => t.label) || [],
      likes: 0, // API doesn't provide likes yet
      isLiked: false, // API doesn't provide this yet
      imageUrl: item.image_url, // Add image if available
    };

    return (
      <FeedItem
        {...feedItemData}
        onLike={handleLike}
      />
    );
  };

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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDreams}
        renderItem={renderItem}
        keyExtractor={(item) => item.share_id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
    </View>
  );
};