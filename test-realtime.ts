import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the mobile app
dotenv.config({ path: path.join(__dirname, 'apps/mobile/.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtime() {
  console.log('🚀 Testing Supabase Realtime...');
  console.log('URL:', supabaseUrl);

  // Subscribe to dreams table
  const channel = supabase
    .channel('test-dreams-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dreams',
      },
      (payload) => {
        console.log('✅ Realtime event received:', {
          type: payload.eventType,
          table: payload.table,
          schema: payload.schema,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to dreams table');
        console.log('\nNow try updating a dream in the database to see if we receive the event...');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error - dreams table might not be enabled for realtime');
        console.log('\nTo fix this, run the following in your Supabase SQL Editor:');
        console.log('ALTER PUBLICATION supabase_realtime ADD TABLE public.dreams;');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Subscription timed out');
      }
    });

  // Keep the script running
  console.log('\nPress Ctrl+C to exit\n');
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🔌 Unsubscribing...');
    supabase.removeChannel(channel);
    process.exit(0);
  });
}

testRealtime().catch(console.error);