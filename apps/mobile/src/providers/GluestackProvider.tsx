import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { customConfig } from '../theme/gluestack-config';

interface GluestackProviderProps {
  children: React.ReactNode;
}

export const GluestackProvider: React.FC<GluestackProviderProps> = ({ children }) => {
  // Use our custom config with dark theme
  return (
    <GluestackUIProvider config={customConfig} colorMode="dark">
      {children}
    </GluestackUIProvider>
  );
};