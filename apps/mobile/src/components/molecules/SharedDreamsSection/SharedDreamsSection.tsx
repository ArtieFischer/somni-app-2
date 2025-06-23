import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, Button, Card } from '../../atoms';
import { 
  Box,
  VStack,
  HStack,
  Center,
  Heading,
  Badge,
  BadgeText
} from '@gluestack-ui/themed';
import { useStyles } from './SharedDreamsSection.styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileIcons } from '../../../constants/profileIcons';
import { useTheme } from '../../../hooks/useTheme';

interface SharedDreamsSectionProps {
  onViewAll?: () => void;
  onCreateShared?: () => void;
}

export const SharedDreamsSection: React.FC<SharedDreamsSectionProps> = ({ 
  onViewAll, 
  onCreateShared 
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const EmptyIcon = ProfileIcons.emptySharedDreams.family;
  const emptyIconName = ProfileIcons.emptySharedDreams.name;

  return (
    <Card>
      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="md" style={styles.sectionTitle}>
            Shared Dreams
          </Heading>
          <Badge variant="outline" action="secondary" size="sm">
            <BadgeText>Coming Soon</BadgeText>
          </Badge>
        </HStack>

        <Box style={styles.emptyStateContainer}>
          <Center>
            <VStack space="md" alignItems="center">
              <EmptyIcon 
                name={emptyIconName as any} 
                size={64} 
                color={theme.colors.text.muted}
              />
              
              <VStack space="xs" alignItems="center">
                <Text variant="body" style={styles.emptyStateTitle}>
                  No Shared Dreams Yet
                </Text>
                <Text variant="caption" color="secondary" style={styles.emptyStateSubtitle}>
                  Share your dreams with the community to get insights and connect with other dreamers
                </Text>
              </VStack>

              <VStack space="sm" style={styles.emptyStateButtons}>
                <Button
                  variant="outline"
                  action="secondary"
                  size="sm"
                  onPress={onCreateShared}
                  isDisabled={true}
                >
                  <Text style={styles.buttonText}>Share a Dream</Text>
                </Button>
                
                <TouchableOpacity 
                  onPress={onViewAll}
                  disabled={true}
                  style={styles.viewAllButton}
                >
                  <Text variant="caption" color="secondary" style={styles.viewAllText}>
                    Browse Community Dreams
                  </Text>
                </TouchableOpacity>
              </VStack>
            </VStack>
          </Center>
        </Box>
      </VStack>
    </Card>
  );
};