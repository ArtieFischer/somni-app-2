import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

interface NotificationContextType {
  isEnabled: boolean;
  isLoading: boolean;
  registerForNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  checkNotificationStatus: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications();
  const { isAuthenticated, profile } = useAuth();

  // Auto-initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && profile?.user_id) {
      // Check notification status but don't auto-register
      // Let the user decide when to enable notifications
      notifications.checkNotificationStatus();
    }
  }, [isAuthenticated, profile?.user_id]);

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}