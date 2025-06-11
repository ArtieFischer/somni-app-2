import React from 'react';
import { View, Pressable, SafeAreaView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '../../atoms/TabBarIcon';
import { Text } from '../../atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { TabIconName } from '@somni/types';
import { useStyles } from './CustomTabBar.styles';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t } = useTranslation('common');
  const styles = useStyles();

  const getIconName = (routeName: string): TabIconName => {
    const iconMap: Record<string, TabIconName> = {
      Feed: 'feed',
      DreamDiary: 'diary',
      Record: 'record',
      MetaAnalysis: 'analysis',
      Profile: 'profile',
    };
    return iconMap[routeName] || 'feed';
  };

  const getTabLabel = (routeName: string): string => {
    const labelMap: Record<string, string> = {
      Feed: t('navigation.tabs.feed'),
      DreamDiary: t('navigation.tabs.dreamDiary'),
      Record: t('navigation.tabs.record'),
      MetaAnalysis: t('navigation.tabs.metaAnalysis'),
      Profile: t('navigation.tabs.profile'),
    };
    return labelMap[routeName] || routeName;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = getIconName(route.name);
          const label = getTabLabel(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <TabBarIcon
                name={iconName}
                focused={isFocused}
                color={isFocused ? styles.activeColor : styles.inactiveColor}
              />
              {iconName !== 'record' && (
                <Text
                  variant="caption"
                  style={[
                    styles.label,
                    { color: isFocused ? styles.activeColor : styles.inactiveColor },
                  ]}
                >
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};