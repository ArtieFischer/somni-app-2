import { useEffect, useRef, useCallback, useMemo } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseRealtimeSubscriptionOptions {
  channelName: string;
  table: string;
  filter?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  onEvent: (payload: any) => void;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export const useRealtimeSubscription = ({
  channelName,
  table,
  filter,
  event = '*',
  onEvent,
  enabled = true,
  maxRetries = 3,
  retryDelay = 5000,
}: UseRealtimeSubscriptionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);
  const onEventRef = useRef(onEvent);
  
  // Update the callback ref when it changes
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Stable configuration object
  const config = useMemo(() => ({
    channelName,
    table,
    filter,
    event,
    enabled,
    maxRetries,
    retryDelay
  }), [channelName, table, filter, event, enabled, maxRetries, retryDelay]);

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      console.log(`🧹 Cleaning up realtime subscription: ${config.channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, [config.channelName]);

  const subscribe = useCallback(() => {
    // Don't create a new subscription if one already exists
    if (channelRef.current || !config.enabled) {
      return;
    }

    console.log(`📡 Creating realtime subscription: ${config.channelName} for table: ${config.table}`);
    
    channelRef.current = supabase
      .channel(config.channelName)
      .on(
        'postgres_changes',
        {
          event: config.event,
          schema: 'public',
          table: config.table,
          ...(config.filter && { filter: config.filter }),
        },
        (payload) => {
          console.log(`🔔 ${config.channelName} event:`, {
            type: payload.eventType,
            table: payload.table,
            timestamp: new Date().toISOString()
          });
          onEventRef.current(payload);
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 ${config.channelName} subscription status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ ${config.channelName}: Successfully subscribed`);
          isSubscribedRef.current = true;
          retryCountRef.current = 0; // Reset retry count on success
        } else if (status === 'TIMED_OUT') {
          console.error(`⏱️ ${config.channelName}: Subscription timed out`);
          
          // Retry logic
          if (retryCountRef.current < config.maxRetries) {
            retryCountRef.current++;
            console.log(`🔄 Retrying subscription (${retryCountRef.current}/${config.maxRetries}) in ${config.retryDelay/1000}s...`);
            
            // Clean up the failed channel
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
            
            // Schedule retry
            retryTimeoutRef.current = setTimeout(() => {
              subscribe();
            }, config.retryDelay);
          } else {
            console.error(`❌ ${config.channelName}: Max retries reached. Giving up.`);
          }
        } else if (status === 'CHANNEL_ERROR') {
          // Handle connection errors with retry logic
          if (err?.message?.includes('Realtime was unable to connect to the project database')) {
            console.log(`⚠️ ${config.channelName}: Initial connection attempt failed, will retry...`);
            
            // Retry logic for connection errors
            if (retryCountRef.current < config.maxRetries) {
              retryCountRef.current++;
              console.log(`🔄 Retrying subscription (${retryCountRef.current}/${config.maxRetries}) in ${config.retryDelay/1000}s...`);
              
              // Clean up the failed channel
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
              
              // Schedule retry
              retryTimeoutRef.current = setTimeout(() => {
                subscribe();
              }, config.retryDelay);
            }
          } else {
            console.error(`❌ ${config.channelName}: Channel error:`, err);
          }
        } else if (status === 'CLOSED') {
          console.log(`🚪 ${config.channelName}: Subscription closed`);
          isSubscribedRef.current = false;
        }
      });
  }, [config]); // Use stable config object

  useEffect(() => {
    if (config.enabled) {
      subscribe();
    }

    return () => {
      cleanup();
    };
  }, [config, subscribe, cleanup]); // Dependencies are now stable

  return {
    isSubscribed: isSubscribedRef.current,
    retry: subscribe,
    cleanup,
  };
};