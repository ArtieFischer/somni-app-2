// Debug script to test signup flow
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase signup flow...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const timestamp = Math.floor(Date.now() / 1000);
  const testEmail = `test${timestamp}@gmail.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `testuser${timestamp}`;

  console.log('\nAttempting signup with:');
  console.log('Email:', testEmail);
  console.log('Username:', testUsername);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
          display_name: testUsername,
        },
      },
    });

    console.log('\nSignup response:');
    console.log('Error:', error);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data) {
      console.log('\nUser object:', data.user);
      console.log('Session:', data.session);
      console.log('User confirmed:', data.user?.confirmed_at);
      console.log('User email confirmed:', data.user?.email_confirmed_at);
    }
  } catch (err) {
    console.error('Exception during signup:', err);
  }
}

testSignup();