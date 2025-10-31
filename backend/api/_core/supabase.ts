import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

// Create a single supabase client for interacting with your database
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      // Set headers for all requests
      headers: { 'x-application-name': 'promorang-backend' },
    },
  }
);

// Helper function to handle Supabase errors
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export function handleSupabaseError(error: any): never {
  if (error instanceof Error) {
    console.error('Supabase Error:', {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    
    const supaError: SupabaseError = {
      message: 'An error occurred while processing your request',
    };
    
    // Add more details in development
    if (process.env.NODE_ENV === 'development') {
      supaError.details = error.message;
      supaError.hint = 'Check server logs for more details';
    }
    
    throw new Error(JSON.stringify({ error: supaError }));
  }
  
  // Handle non-Error objects
  console.error('Unexpected error format:', error);
  throw new Error(JSON.stringify({
    error: {
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    },
  }));
}

// Helper function to safely execute Supabase operations
export async function safeSupabase<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  errorMessage = 'Operation failed'
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`${errorMessage}:`, error);
      throw error;
    }
    
    if (data === null) {
      throw new Error('No data returned from the database');
    }
    
    return data;
  } catch (error) {
    return handleSupabaseError(error);
  }
}
