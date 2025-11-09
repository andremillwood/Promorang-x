import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Supabase configuration is missing');
  console.error('❌ Supabase Error:', {
    message: error.message,
    supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
    supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-dnysosmscoceplvcejkv-auth-token',
  },
  db: {
    schema: 'public, auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'promorang-x',
    },
  },
});

console.log('✅ Supabase client initialized with URL:', supabaseUrl);

export default supabase;
