import { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  connectionQuality: 'poor' | 'good' | 'excellent' | 'unknown';
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
    connectionQuality: 'unknown'
  });

  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(null);
  const lastStatusRef = useRef<string>('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        connectionQuality: determineConnectionQuality(state)
      };

      // Only update if there's a real change
      const statusString = JSON.stringify(newStatus);
      if (statusString !== lastStatusRef.current) {
        lastStatusRef.current = statusString;
        setNetworkStatus(newStatus);
        setLastConnectionCheck(new Date());
        
        // Only log significant changes in development
        if (__DEV__) {
          console.log('📶 Network state changed:', {
            isConnected: newStatus.isConnected,
            isInternetReachable: newStatus.isInternetReachable,
            type: newStatus.type,
            quality: newStatus.connectionQuality
          });
        }
      }
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      const initialStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        connectionQuality: determineConnectionQuality(state)
      };
      setNetworkStatus(initialStatus);
      setLastConnectionCheck(new Date());
      lastStatusRef.current = JSON.stringify(initialStatus);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const isOnline = (state.isConnected && state.isInternetReachable) ?? false;
      setLastConnectionCheck(new Date());
      return isOnline;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  };

  const getConnectionStatusText = (): string => {
    if (!networkStatus.isConnected) {
      return 'No connection';
    }
    
    if (!networkStatus.isInternetReachable) {
      return 'Connected but no internet';
    }

    const typeText = networkStatus.isWifi ? 'WiFi' : 
                    networkStatus.isCellular ? 'Cellular' : 
                    networkStatus.type;
    
    return `Connected via ${typeText} (${networkStatus.connectionQuality})`;
  };

  return {
    ...networkStatus,
    checkConnection,
    getConnectionStatusText,
    lastConnectionCheck,
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable,
  };
};

// Helper function to determine connection quality
function determineConnectionQuality(state: any): 'poor' | 'good' | 'excellent' | 'unknown' {
  if (state.type === 'wifi') {
    return 'excellent';
  }

  if (state.type === 'cellular' && state.details) {
    const cellularGeneration = state.details.cellularGeneration;
    
    switch (cellularGeneration) {
      case '5g':
        return 'excellent';
      case '4g':
        return 'good';
      case '3g':
        return 'poor';
      case '2g':
        return 'poor';
      default:
        return 'good';
    }
  }

  if (state.type === 'ethernet') {
    return 'excellent';
  }

  return 'unknown';
}