import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Remove after regenerating database types from the operational migration.
export const operationalSupabase = supabase as unknown as SupabaseClient;
