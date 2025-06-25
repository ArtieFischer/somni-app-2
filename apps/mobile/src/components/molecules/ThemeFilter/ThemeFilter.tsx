import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable, Text } from '../../ui';
import { useTheme } from '../../../hooks/useTheme';

interface Theme {
  id: string;
  name: string;
  symbol: string;
  count?: number;
}

interface ThemeFilterProps {
  themes: Theme[];
  selectedTheme: string | null;
  onThemeSelect: (themeId: string | null) => void;
}

export const ThemeFilter: React.FC<ThemeFilterProps> = ({
  themes,
  selectedTheme,
  onThemeSelect,
}) => {
  const theme = useTheme();
  const scrollViewRef = React.useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Dreams filter */}
        <Pressable
          onPress={() => onThemeSelect(null)}
          style={[
            styles.themeCircle,
            {
              backgroundColor: selectedTheme === null 
                ? theme.colors.secondary + '20' 
                : theme.colors.background.elevated,
              borderColor: selectedTheme === null 
                ? theme.colors.secondary 
                : theme.colors.background.elevated,
            }
          ]}
        >
          <Text
            style={[
              styles.themeText,
              {
                color: selectedTheme === null 
                  ? theme.colors.secondary 
                  : theme.colors.text.primary,
                fontWeight: selectedTheme === null ? '600' : '400',
              }
            ]}
          >
            All
          </Text>
        </Pressable>

        {themes.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onThemeSelect(item.id)}
            style={[
              styles.themeCircle,
              {
                backgroundColor: selectedTheme === item.id 
                  ? theme.colors.secondary + '20' 
                  : theme.colors.background.elevated,
                borderColor: selectedTheme === item.id 
                  ? theme.colors.secondary 
                  : theme.colors.background.elevated,
              }
            ]}
          >
            <Text style={styles.themeSymbol}>{item.symbol}</Text>
            <Text
              style={[
                styles.themeText,
                {
                  color: selectedTheme === item.id 
                    ? theme.colors.secondary 
                    : theme.colors.text.primary,
                  fontWeight: selectedTheme === item.id ? '600' : '400',
                }
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.count && (
              <Text
                style={[
                  styles.themeCount,
                  { color: theme.colors.text.secondary }
                ]}
              >
                {item.count}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  themeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  themeSymbol: {
    fontSize: 20,
    marginBottom: 2,
  },
  themeText: {
    fontSize: 11,
    textAlign: 'center',
  },
  themeCount: {
    fontSize: 9,
    marginTop: 2,
  },
});