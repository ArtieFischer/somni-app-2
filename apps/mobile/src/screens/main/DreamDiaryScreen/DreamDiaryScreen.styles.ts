import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    headerContainer: {
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.medium,
    },
    
    // Search styles
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.medium,
      height: 48,
      marginBottom: theme.spacing.medium,
      ...theme.shadows.small,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: theme.spacing.small,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    clearIcon: {
      fontSize: 18,
      color: theme.colors.text.secondary,
      paddingLeft: theme.spacing.small,
    },
    
    // Filter styles
    filtersContainer: {
      marginBottom: theme.spacing.medium,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.background.elevated,
      marginRight: theme.spacing.small,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    filterText: {
      color: theme.colors.text.secondary,
    },
    filterTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    
    // Stats styles
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      marginBottom: theme.spacing.large,
      alignItems: 'center',
      justifyContent: 'space-around',
      ...theme.shadows.small,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border.primary,
      marginHorizontal: theme.spacing.medium,
    },
    
    // Dream card styles
    dreamCard: {
      marginHorizontal: theme.spacing.large,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      ...theme.shadows.small,
    },
    dreamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.medium,
    },
    dateContainer: {
      flex: 1,
    },
    dateText: {
      fontWeight: '600',
      marginBottom: 2,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
    },
    duration: {
      color: theme.colors.text.secondary,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dreamText: {
      lineHeight: 22,
      marginBottom: theme.spacing.medium,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.medium,
    },
    tag: {
      backgroundColor: theme.colors.accent + '20',
      paddingHorizontal: theme.spacing.small,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.small,
      marginRight: theme.spacing.small,
      marginBottom: theme.spacing.small,
    },
    tagText: {
      color: theme.colors.accent,
      fontSize: 12,
    },
    dreamFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    analyzeButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    analyzeButtonText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    
    // Empty state
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl * 2,
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: theme.spacing.large,
    },
    emptyTitle: {
      marginBottom: theme.spacing.small,
      textAlign: 'center',
    },
    emptySubtitle: {
      textAlign: 'center',
      lineHeight: 22,
    },
    
    separator: {
      height: theme.spacing.medium,
    },
  });
};