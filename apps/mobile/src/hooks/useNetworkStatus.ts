import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  connectionQuality: 'poor' | 'good' | 'excellent' | 'unknown';
}

// Global simulation state (for testing)
let simulationOverride: NetworkStatus | null = null;

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

  useEffect(() => {
    // If simulation is active, use simulated data
    if (simulationOverride) {
      setNetworkStatus(simulationOverride);
      setLastConnectionCheck(new Date());
      return;
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      // Only log when there's an actual change, not every second
      const newStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        connectionQuality: determineConnectionQuality(state)
      };

      // Only update if there's a real change
      setNetworkStatus(prevStatus => {
        const hasChanged = 
          prevStatus.isConnected !== newStatus.isConnected ||
          prevStatus.isInternetReachable !== newStatus.isInternetReachable ||
          prevStatus.type !== newStatus.type ||
          prevStatus.connectionQuality !== newStatus.connectionQuality;

        if (hasChanged) {
          console.log('📶 Real network state changed:', newStatus);
          setLastConnectionCheck(new Date());
        }

        return newStatus;
      });
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
    });

    return () => unsubscribe();
  }, [simulationOverride]);

  const checkConnection = async (): Promise<boolean> => {
    try {
      if (simulationOverride) {
        return simulationOverride.isConnected && simulationOverride.isInternetReachable;
      }

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

  // Simulation functions
  const simulateNetworkCondition = (condition: Partial<NetworkStatus>) => {
    const newStatus: NetworkStatus = {
      isConnected: condition.isConnected ?? true,
      isInternetReachable: condition.isInternetReachable ?? true,
      type: condition.type ?? 'wifi',
      isWifi: condition.isWifi ?? (condition.type === 'wifi'),
      isCellular: condition.isCellular ?? (condition.type === 'cellular'),
      connectionQuality: condition.connectionQuality ?? 'good'
    };

    simulationOverride = newStatus;
    setNetworkStatus(newStatus);
    setLastConnectionCheck(new Date());
    
    console.log('🧪 Network simulation activated:', newStatus);
  };

  const clearSimulation = () => {
    simulationOverride = null;
    console.log('🧪 Network simulation cleared, using real network state');
    
    // Refresh real network state
    NetInfo.fetch().then(state => {
      const realStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        connectionQuality: determineConnectionQuality(state)
      };
      setNetworkStatus(realStatus);
      setLastConnectionCheck(new Date());
    });
  };

  return {
    ...networkStatus,
    checkConnection,
    getConnectionStatusText,
    lastConnectionCheck,
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable,
    
    // Simulation functions for testing
    simulateNetworkCondition,
    clearSimulation,
    isSimulated: simulationOverride !== null
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