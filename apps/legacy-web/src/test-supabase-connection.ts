import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test users table query
    console.log('\n🔍 Querying users table...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    console.log('Query result:', { data, error });
    
    if (error) {
      console.error('❌ Error querying users table:', error);
    } else {
      console.log('✅ Successfully queried users table');
      if (data && data.length > 0) {
        console.log('📋 First user:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('ℹ️ No users found in the users table');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
