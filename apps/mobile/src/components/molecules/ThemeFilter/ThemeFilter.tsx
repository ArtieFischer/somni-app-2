import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable, Text } from '../../ui';
import { useTheme } from '../../../hooks/useTheme';

interface Theme {
  id: string;
  name: string;
  symbol?: string;
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
  const scrollPositionRef = React.useRef(0);

  const handleThemeSelect = (themeId: string | null) => {
    onThemeSelect(themeId);
  };

  // Restore scroll position after component updates
  React.useEffect(() => {
    if (scrollViewRef.current && scrollPositionRef.current > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollPositionRef.current, animated: false });
      }, 0);
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => {
          scrollPositionRef.current = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {/* All Dreams filter */}
        <Pressable
          onPress={() => handleThemeSelect(null)}
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
                fontWeight: selectedTheme === null ? '700' : '500',
              }
            ]}
          >
            All
          </Text>
        </Pressable>

        {themes.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleThemeSelect(item.id)}
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
            <View style={styles.themeContent}>
              <Text
                style={[
                  styles.themeText,
                  {
                    color: selectedTheme === item.id 
                      ? theme.colors.secondary 
                      : theme.colors.text.primary,
                    fontWeight: selectedTheme === item.id ? '700' : '500',
                  }
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            {item.count !== undefined && (
              <Text
                style={[
                  styles.themeCount,
                  { 
                    color: theme.colors.text.secondary,
                    position: 'absolute',
                    bottom: 8,
                  }
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
    height: 80,
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  themeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    position: 'relative',
  },
  themeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeSymbol: {
    fontSize: 20,
    marginBottom: 2,
  },
  themeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  themeCount: {
    fontSize: 9,
    opacity: 0.6,
  },
});