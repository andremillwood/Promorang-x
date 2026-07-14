import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./client";

// The operational migration is newer than the checked-in generated Database type.
// Remove this adapter after the next `supabase gen types` refresh.
export const operationalSupabase = supabase as unknown as SupabaseClient;
