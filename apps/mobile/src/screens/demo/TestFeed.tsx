import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from '../../components/atoms';
import { ThemeFilter } from '../../components/molecules/ThemeFilter/ThemeFilter';
import { FeedItem } from '../../components/molecules/FeedItem/FeedItem';
import { mockThemes, mockDreams } from '../main/FeedScreen/mockData';
import { useTheme } from '../../hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TestFeed: React.FC = () => {
  const theme = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Filter dreams based on selected theme
  const filteredDreams = React.useMemo(() => {
    if (!selectedTheme) return mockDreams;
    const selectedThemeName = mockThemes.find(t => t.id === selectedTheme)?.name;
    return mockDreams.filter(dream => 
      dream.themes?.some(t => t === selectedThemeName)
    );
  }, [selectedTheme]);

  const handleLike = (dreamId: string) => {
    console.log('Liked dream:', dreamId);
  };

  const renderHeader = () => (
    <>
      <Text variant="h1" style={styles.title}>
        Dream Feed
      </Text>
      <ThemeFilter
        themes={mockThemes}
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
      />
    </>
  );

  const renderItem = ({ item }: { item: typeof mockDreams[0] }) => (
    <FeedItem
      {...item}
      onLike={handleLike}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={filteredDreams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
});