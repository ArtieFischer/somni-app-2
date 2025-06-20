import { supabase } from '../lib/supabase';

export const testDatabaseRealtime = async (userId: string) => {
  console.log('🧪 Testing Database Realtime subscription...');
  
  // Test 1: Subscribe without any filters
  const simpleChannel = supabase
    .channel('test-simple-db')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dreams'
      },
      (payload) => {
        console.log('✅ Database change received (no filter):', payload);
      }
    )
    .subscribe((status, err) => {
      console.log('📡 Simple DB channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Simple database subscription successful!');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Simple database subscription timed out');
      } else if (err) {
        console.error('❌ Simple DB error:', err);
      }
    });

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Subscribe with user filter (like your app does)
  const filteredChannel = supabase
    .channel('test-filtered-db')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dreams',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('✅ Database change received (with filter):', payload);
      }
    )
    .subscribe((status, err) => {
      console.log('📡 Filtered DB channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Filtered database subscription successful!');
        
        // Test by updating a dream
        console.log('🔧 Testing by updating a dream...');
        testDreamUpdate(userId);
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Filtered database subscription timed out');
      } else if (err) {
        console.error('❌ Filtered DB error:', err);
      }
    });

  // Cleanup after 10 seconds
  setTimeout(() => {
    console.log('🧹 Cleaning up test channels');
    supabase.removeChannel(simpleChannel);
    supabase.removeChannel(filteredChannel);
  }, 10000);
};

const testDreamUpdate = async (userId: string) => {
  // Get a dream to update
  const { data: dreams, error } = await supabase
    .from('dreams')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error || !dreams || dreams.length === 0) {
    console.log('❌ No dreams found to test update');
    return;
  }

  const dreamId = dreams[0].id;
  console.log('🔧 Updating dream:', dreamId);

  // Update the dream
  const { error: updateError } = await supabase
    .from('dreams')
    .update({ 
      transcription_metadata: { 
        realtime_test: new Date().toISOString() 
      } 
    })
    .eq('id', dreamId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('❌ Failed to update dream:', updateError);
  } else {
    console.log('✅ Dream updated - check if realtime event was received');
  }
};