import { supabase } from '../lib/supabase';

export const testRealtimeSubscription = async (userId: string) => {
  console.log('🔍 Testing real-time subscription for user:', userId);
  
  // Test 1: Basic connection
  const testChannel = supabase.channel('test-connection');
  
  testChannel
    .on('presence', { event: 'sync' }, () => {
      console.log('✅ Real-time connection established');
    })
    .subscribe((status) => {
      console.log('📡 Connection status:', status);
    });
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Dreams table subscription
  const dreamsChannel = supabase
    .channel(`test-dreams-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'dreams',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🎯 Dreams table event received:', {
          eventType: payload.eventType,
          table: payload.table,
          schema: payload.schema,
          new: payload.new,
          old: payload.old,
          errors: payload.errors,
        });
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('❌ Subscription error:', err);
      } else {
        console.log('📊 Dreams subscription status:', status);
      }
    });
  
  // Test 3: Check if table exists and has RLS
  const { data: tableInfo, error: tableError } = await supabase
    .rpc('pg_tables')
    .eq('schemaname', 'public')
    .eq('tablename', 'dreams');
  
  if (tableError) {
    console.error('❌ Error checking table:', tableError);
  } else {
    console.log('📋 Table info:', tableInfo);
  }
  
  // Test 4: Try to fetch dreams to ensure permissions
  const { data: dreams, error: dreamsError } = await supabase
    .from('dreams')
    .select('id, transcription_status, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5);
  
  if (dreamsError) {
    console.error('❌ Error fetching dreams:', dreamsError);
  } else {
    console.log('📚 Recent dreams:', dreams);
  }
  
  return {
    testChannel,
    dreamsChannel,
    cleanup: () => {
      console.log('🧹 Cleaning up test channels');
      supabase.removeChannel(testChannel);
      supabase.removeChannel(dreamsChannel);
    }
  };
};

// Function to manually trigger an update to test real-time
export const triggerTestUpdate = async (dreamId: string, userId: string) => {
  console.log('🔧 Triggering test update for dream:', dreamId);
  
  const { data, error } = await supabase
    .from('dreams')
    .update({ 
      transcription_metadata: { 
        test_update: new Date().toISOString(),
        test_counter: Math.random()
      } 
    })
    .eq('id', dreamId)
    .eq('user_id', userId)
    .select();
  
  if (error) {
    console.error('❌ Error updating dream:', error);
  } else {
    console.log('✅ Dream updated:', data);
  }
  
  return { data, error };
};