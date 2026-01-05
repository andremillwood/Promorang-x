import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// Define database tables
export const db = {
  // User tables
  users: () => supabase.from('users'),
  refresh_tokens: () => supabase.from('refresh_tokens'),
  password_resets: () => supabase.from('password_resets'),
  
  // Helper to handle Supabase responses consistently
  handleResponse: async <T>(promise: Promise<{ data: T | null; error: any }>) => {
    try {
      const { data, error } = await promise;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Database operation failed');
    }
  },
};

// Database types
declare global {
  type Database = {
    public: {
      Tables: {
        users: {
          Row: {
            id: string;
            email: string;
            username: string;
            display_name: string | null;
            user_type: string;
            points_balance: number;
            keys_balance: number;
            gems_balance: number;
            email_verified: boolean;
            verification_token: string | null;
            password_hash: string;
            created_at: string;
            updated_at: string;
          };
        };
        refresh_tokens: {
          Row: {
            id: string;
            user_id: string;
            token: string;
            expires_at: string;
            created_at: string;
            updated_at: string;
          };
        };
        password_resets: {
          Row: {
            id: string;
            email: string;
            token: string;
            expires_at: string;
            created_at: string;
          };
        };
      };
    };
  };
}

console.log('✅ Database client initialized');
