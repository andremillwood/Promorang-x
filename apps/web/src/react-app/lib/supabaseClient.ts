import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client singleton
 * Ensures only one instance exists throughout the app lifecycle
 */
export function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

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

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'sb-dnysosmscoceplvcejkv-auth-token',
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'promorang-x',
      },
    },
  });

  console.log('✅ Supabase client initialized (singleton) with URL:', supabaseUrl);

  return supabaseClient;
}

// Export singleton instance
export const supabase = getSupabase();

export default supabase;
