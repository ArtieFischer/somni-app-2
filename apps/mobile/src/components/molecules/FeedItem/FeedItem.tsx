import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image, Pressable, Text, HStack, VStack } from '../../ui';
import { Card } from '../../atoms';
import { useTheme } from '../../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface FeedItemProps {
  id: string;
  imageUrl?: string;
  username?: string;
  isAnonymous?: boolean;
  date: Date;
  location?: string;
  transcription: string;
  likes: number;
  isLiked?: boolean;
  themes?: string[];
  onLike?: (id: string) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  id,
  imageUrl,
  username,
  isAnonymous = false,
  date,
  location,
  transcription,
  likes,
  isLiked = false,
  themes,
  onLike,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikes, setLocalLikes] = useState(likes);

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);
    onLike?.(id);
  };

  const truncateText = (text: string, lines: number = 3) => {
    const maxLength = lines * 50; // Approximate chars per line
    if (text.length <= maxLength || expanded) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card marginBottom={16} noPadding shadowIntensity="light">
      {/* Header */}
      <View style={styles.header}>
        <HStack space="sm" alignItems="center">
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              {isAnonymous ? '?' : username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <VStack space="xs">
            <Text variant="body" fontWeight="$medium" color={theme.colors.text.primary}>
              {isAnonymous ? 'Anonymous Dreamer' : username}
            </Text>
            <HStack space="xs" alignItems="center">
              <Text variant="caption" color={theme.colors.text.secondary}>
                {formatDate(date)}
              </Text>
              {location && (
                <>
                  <Text variant="caption" color={theme.colors.text.secondary}>·</Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    {location}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </HStack>
      </View>

      {/* Image */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          alt="Dream image"
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Themes */}
        {themes && themes.length > 0 && (
          <HStack space="xs" flexWrap="wrap" mb="$2">
            {themes.map((themeName, index) => (
              <View
                key={index}
                style={[
                  styles.themeBadge,
                  { backgroundColor: theme.colors.secondary + '15' }
                ]}
              >
                <Text
                  variant="caption"
                  style={{ color: theme.colors.secondary }}
                >
                  {themeName}
                </Text>
              </View>
            ))}
          </HStack>
        )}

        {/* Transcription */}
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text variant="body" lineHeight={22} color={theme.colors.text.primary}>
            {truncateText(transcription)}
          </Text>
          {transcription.length > 150 && (
            <Text 
              variant="caption" 
              style={{ color: theme.colors.secondary, marginTop: 4 }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          )}
        </Pressable>

        {/* Actions */}
        <HStack space="md" alignItems="center" mt="$3">
          <Pressable onPress={handleLike} style={styles.likeButton}>
            <HStack space="xs" alignItems="center">
              <Ionicons
                name={localIsLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={localIsLiked ? theme.colors.status.error : theme.colors.text.secondary}
              />
              <Text 
                variant="body" 
                color={localIsLiked ? theme.colors.status.error : theme.colors.text.secondary}
              >
                {localLikes}
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: screenWidth - 32,
    height: screenWidth - 32, // 1:1 aspect ratio (square)
  },
  content: {
    padding: 16,
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  likeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: -8,
  },
});