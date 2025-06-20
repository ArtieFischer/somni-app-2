import { supabase } from '../lib/supabase';

let renderCount = 0;
let subscriptionCount = 0;

export const testSubscriptionStability = () => {
  renderCount++;
  console.log(`🔄 Component rendered ${renderCount} times`);
  
  // Check how many active channels exist
  const activeChannels = (supabase as any).realtime?.channels || [];
  console.log(`📡 Active channels: ${Object.keys(activeChannels).length}`);
  
  // Log each channel
  Object.keys(activeChannels).forEach(channelName => {
    console.log(`  - ${channelName}`);
  });
};

export const resetTestCounters = () => {
  renderCount = 0;
  subscriptionCount = 0;
  console.log('🔄 Test counters reset');
};