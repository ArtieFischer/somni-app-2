// Test script for real-time subscription debugging
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🚀 Testing Supabase Real-time Subscription');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtimeSubscription() {
  // First, sign in as a test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com', // Replace with your test user
    password: 'testpassword123', // Replace with your test password
  });

  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }

  const userId = authData.user?.id;
  console.log('✅ Signed in as user:', userId);

  // Set up real-time subscription
  console.log('📡 Setting up real-time subscription...');
  
  const channel = supabase
    .channel(`test-dreams-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dreams',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🎯 Real-time event received:', {
          type: payload.eventType,
          dreamId: payload.new?.id || payload.old?.id,
          transcriptionStatus: payload.new?.transcription_status,
          timestamp: new Date().toISOString(),
        });
      }
    )
    .subscribe((status) => {
      console.log('📊 Subscription status:', status);
    });

  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create a test dream
  console.log('📝 Creating test dream...');
  const { data: dream, error: createError } = await supabase
    .from('dreams')
    .insert({
      user_id: userId,
      raw_transcript: 'Test dream transcript',
      transcription_status: 'pending',
      duration: 60,
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating dream:', createError);
    return;
  }

  console.log('✅ Dream created:', dream.id);

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update the dream to trigger real-time event
  console.log('📝 Updating dream transcription status...');
  const { error: updateError } = await supabase
    .from('dreams')
    .update({
      transcription_status: 'completed',
      raw_transcript: 'This is the completed transcription of the test dream.',
    })
    .eq('id', dream.id)
    .eq('user_id', userId);

  if (updateError) {
    console.error('❌ Error updating dream:', updateError);
  } else {
    console.log('✅ Dream updated successfully');
  }

  // Wait to see if we receive the real-time event
  console.log('⏳ Waiting for real-time event...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Cleanup
  console.log('🧹 Cleaning up...');
  
  // Delete test dream
  await supabase
    .from('dreams')
    .delete()
    .eq('id', dream.id)
    .eq('user_id', userId);

  // Remove channel
  supabase.removeChannel(channel);

  // Sign out
  await supabase.auth.signOut();
  
  console.log('✅ Test complete');
}

// Run the test
testRealtimeSubscription().catch(console.error);