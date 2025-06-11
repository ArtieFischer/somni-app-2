import React, { useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  TextInput,
  ScrollView 
} from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { useTheme } from '../../../hooks/useTheme';
import { Dream } from '@somni/types';
import { useStyles } from './DreamDiaryScreen.styles';

export const DreamDiaryScreen: React.FC = () => {
  const { t } = useTranslation('dreams');
  const theme = useTheme();
  const styles = useStyles();
  const { dreams, searchDreams } = useDreamStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lucid' | 'recent'>('all');
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would sync with backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return String(t('time.today'));
    } else if (date.toDateString() === yesterday.toDateString()) {
      return String(t('time.yesterday'));
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Dream['status']) => {
    switch (status) {
      case 'completed':
        return theme.colors.status.success;
      case 'transcribing':
        return theme.colors.status.warning;
      case 'failed':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const renderDreamItem = ({ item }: { item: Dream }) => (
    <TouchableOpacity style={styles.dreamCard} activeOpacity={0.8}>
      <View style={styles.dreamHeader}>
        <View style={styles.dateContainer}>
          <Text variant="body" style={styles.dateText}>
            {formatDate(item.recordedAt)}
          </Text>
          <Text variant="caption" color="secondary">
            {formatTime(item.recordedAt)}
          </Text>
        </View>
        <View style={styles.metaContainer}>
          <Text variant="caption" style={styles.duration}>
            🎙️ {formatDuration(item.duration)}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
      </View>

      <Text 
        variant="body" 
        style={styles.dreamText}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {item.rawTranscript || String(t('record.processing'))}
      </Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text variant="caption" style={styles.tagText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.dreamFooter}>
        <Text variant="caption" color="secondary">
          {item.confidence ? `${Math.round(item.confidence * 100)}% ${String(t('analysis.confidence', { percentage: Math.round(item.confidence * 100) }))}` : ''}
        </Text>
        <TouchableOpacity style={styles.analyzeButton}>
          <Text variant="caption" style={styles.analyzeButtonText}>
            {String(t('analysis.title'))} →
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={String(t('journal.search'))}
          placeholderTextColor={theme.colors.text.disabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {(['all', 'recent', 'lucid'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text 
              variant="caption" 
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}
            >
              {String(t(`journal.filters.${filter}`))}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text variant="h2" style={styles.statValue}>
            {dreams.length}
          </Text>
          <Text variant="caption" color="secondary">
            {String(t('journal.stats.total'))}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text variant="h2" style={styles.statValue}>
            {dreams.filter(d => d.tags?.includes('lucid')).length}
          </Text>
          <Text variant="caption" color="secondary">
            {String(t('journal.stats.lucid'))}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text variant="h2" style={styles.statValue}>
            {dreams.length > 0 
              ? Math.round(dreams.reduce((acc, d) => acc + d.confidence, 0) / dreams.length * 100)
              : 0}%
          </Text>
          <Text variant="caption" color="secondary">
            {String(t('journal.stats.avgMood'))}
          </Text>
        </View>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💭</Text>
      <Text variant="h3" style={styles.emptyTitle}>
        {String(t('journal.empty'))}
      </Text>
      <Text variant="body" color="secondary" style={styles.emptySubtitle}>
        {String(t('journal.emptySubtitle'))}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDreams}
        renderItem={renderDreamItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};