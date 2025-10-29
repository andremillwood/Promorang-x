import { createClient } from '@supabase/supabase-js';

// Use environment variables with safe fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

console.log("🔧 Supabase Client: Initializing...");
console.log("📍 Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("🔑 Supabase Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ Supabase Client: Created successfully");

// Test Supabase connection
console.log("🔍 Testing Supabase connection...");
supabase.from('test').select('*').then((result: any) => {
  console.log("🗄️ Supabase Connection Test:", result.error ? "❌ Error: " + result.error.message : "✅ Success - " + result.data?.length + " rows found");
}).catch((error: any) => {
  console.error("🗄️ Supabase Connection Failed:", error);
});
