import React from 'react';
import { HStack } from '@gluestack-ui/themed';
import { PillButton } from '../../../components/atoms';

export type TabType = 'overview' | 'analysis' | 'reflection';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'overview' as TabType, label: 'Overview' },
  { id: 'analysis' as TabType, label: 'Analysis' },
  { id: 'reflection' as TabType, label: 'Reflection' },
];

export const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <HStack space="sm">
      {tabs.map((tab) => (
        <PillButton
          key={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onPress={() => onTabChange(tab.id)}
          flex={1}
        />
      ))}
    </HStack>
  );
};