import { supabase } from '../lib/supabase';

export const testRealtimeConnection = async () => {
  console.log('🧪 Testing Supabase Realtime connection...');
  
  // Test 1: Basic channel subscription without database
  const testChannel = supabase.channel('test-connection');
  
  let subscribed = false;
  
  testChannel
    .on('presence', { event: 'sync' }, () => {
      console.log('✅ Presence sync received - WebSocket is working!');
      subscribed = true;
    })
    .subscribe(async (status, err) => {
      console.log('📡 Test channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Basic WebSocket connection successful');
        
        // Clean up
        setTimeout(() => {
          supabase.removeChannel(testChannel);
        }, 1000);
      } else if (status === 'TIMED_OUT') {
        console.error('❌ WebSocket connection timed out');
        console.log('Possible causes:');
        console.log('1. Network connectivity issues');
        console.log('2. Firewall blocking WebSocket connections');
        console.log('3. Supabase Realtime service is down');
        
        // Test REST API connection
        const { data, error } = await supabase.from('dreams').select('count').limit(1);
        if (error) {
          console.error('❌ REST API also failing:', error);
        } else {
          console.log('✅ REST API works, only WebSocket is failing');
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error:', err);
      }
    });
  
  // Timeout check
  setTimeout(() => {
    if (!subscribed) {
      console.error('❌ No response after 10 seconds - WebSocket likely blocked');
      supabase.removeChannel(testChannel);
    }
  }, 10000);
};

// Export a hook version for components
export const useTestRealtimeConnection = () => {
  return testRealtimeConnection;
};