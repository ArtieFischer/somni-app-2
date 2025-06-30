import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../atoms';
import { useTheme } from '../../hooks/useTheme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type IconType = 'material' | 'ionicons';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  iconName?: string;
  iconType?: IconType;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();
  
  const styles = createStyles(theme);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: theme.spacing.medium }]}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive 
                  ? theme.colors.primary + '20'
                  : 'transparent',
                borderColor: isActive 
                  ? theme.colors.primary 
                  : theme.colors.border.primary + '30',
              },
            ]}
          >
            {(tab.iconName || tab.icon) && (
              <View style={styles.iconContainer}>
                {tab.iconName ? (
                  tab.iconType === 'ionicons' ? (
                    <Ionicons 
                      name={tab.iconName as any} 
                      size={16} 
                      color={isActive ? theme.colors.primary : theme.colors.text.secondary}
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    />
                  ) : (
                    <MaterialCommunityIcons 
                      name={tab.iconName as any} 
                      size={16} 
                      color={isActive ? theme.colors.primary : theme.colors.text.secondary}
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    />
                  )
                ) : (
                  <Text style={[styles.icon, { opacity: isActive ? 1 : 0.6 }]}>
                    {tab.icon}
                  </Text>
                )}
              </View>
            )}
            <Text
              variant="body"
              style={[
                styles.label,
                {
                  color: isActive 
                    ? theme.colors.primary 
                    : theme.colors.text.secondary,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  contentContainer: {
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
  },
});