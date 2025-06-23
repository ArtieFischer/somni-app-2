// Direct test of signup with better error handling
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'apps/mobile/.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase signup flow...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const timestamp = Math.floor(Date.now() / 1000);
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `testuser${timestamp}`;

  console.log('\nAttempting signup with:');
  console.log('Email:', testEmail);
  console.log('Username:', testUsername);

  try {
    // First, let's check if we can query the profiles table
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('handle')
      .limit(1);
    
    console.log('\nProfile table check:');
    console.log('Can access profiles:', profileError ? 'No' : 'Yes');
    if (profileError) {
      console.log('Profile error:', profileError);
    }

    // Now try signup
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
          display_name: testUsername,
          handle: testUsername, // Try passing handle directly
        },
      },
    });

    console.log('\nSignup response:');
    if (error) {
      console.log('Error:', error);
      console.log('Error message:', error.message);
      console.log('Error status:', (error as any).status);
      console.log('Error code:', (error as any).code);
      
      // Check if user was created in auth.users
      if (data?.user) {
        console.log('\nUser was created in auth.users but profile creation failed');
        console.log('User ID:', data.user.id);
        
        // Try to check what happened with the profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        console.log('\nProfile check:');
        console.log('Profile exists:', profile ? 'Yes' : 'No');
        console.log('Profile error:', profileErr);
      }
    } else {
      console.log('Success! User created:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at);
      
      // Check the profile
      if (data.user) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        console.log('\nProfile created:');
        console.log(profile);
      }
    }
  } catch (err) {
    console.error('Exception during signup:', err);
  }
}

// Also test the trigger function directly
async function testTriggerLogic() {
  console.log('\n\nTesting trigger logic...');
  
  const testId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Simulate what the trigger does
  const mockUserMetadata = {
    handle: `testhandle${timestamp}`,
    username: `testuser${timestamp}`,
    display_name: `Test User ${timestamp}`,
    sex: 'unspecified',
    locale: 'en'
  };
  
  console.log('Mock user metadata:', mockUserMetadata);
  
  // Test handle generation logic
  const handle = mockUserMetadata.handle || 
                mockUserMetadata.username || 
                `user_${testId.substring(0, 8)}`;
                
  console.log('Generated handle:', handle);
  
  // Test sex enum casting
  const sexValue = mockUserMetadata.sex || 'unspecified';
  console.log('Sex value:', sexValue);
}

async function main() {
  await testSignup();
  await testTriggerLogic();
}

main();