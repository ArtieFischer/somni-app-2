import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';

interface MultiSelectChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const MultiSelectChip: React.FC<MultiSelectChipProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.secondary,
      marginRight: theme.spacing.small,
      marginBottom: theme.spacing.small,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: theme.typography.body.fontWeight as any,
      color: theme.colors.text.primary,
    },
    chipTextSelected: {
      color: theme.colors.text.inverse,
    },
  });
};
