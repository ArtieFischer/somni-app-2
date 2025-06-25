import React, { useState, useMemo } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Text } from '../../../components/atoms';
import { ThemeFilter } from '../../../components/molecules/ThemeFilter/ThemeFilter';
import { FeedItem } from '../../../components/molecules/FeedItem/FeedItem';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './FeedScreen.styles';
import { mockThemes, mockDreams } from './mockData';

export const FeedScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const styles = useStyles();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Filter dreams based on selected theme
  const filteredDreams = useMemo(() => {
    if (!selectedTheme) return mockDreams;
    const selectedThemeName = mockThemes.find(t => t.id === selectedTheme)?.name;
    return mockDreams.filter(dream => 
      dream.themes?.some(theme => theme === selectedThemeName)
    );
  }, [selectedTheme]);

  const handleLike = (dreamId: string) => {
    console.log('Liked dream:', dreamId);
    // In real app, this would update the backend
  };

  const renderHeader = () => (
    <ThemeFilter
      themes={mockThemes}
      selectedTheme={selectedTheme}
      onThemeSelect={setSelectedTheme}
    />
  );

  const renderItem = ({ item }: { item: typeof mockDreams[0] }) => (
    <FeedItem
      {...item}
      onLike={handleLike}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDreams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};