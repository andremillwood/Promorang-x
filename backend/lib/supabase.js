const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// ALWAYS use the Service Role Key for backend operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase Administrative credentials NOT found. Backend operations will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection silently
if (supabaseUrl && supabaseServiceKey) {
  supabase.from('users').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) console.error('[Supabase] Auth Bridge connection warning:', error.message);
      else console.log('✅ Supabase Auth Bridge Ready');
    });
}

module.exports = { 
  supabase,
  admin: supabase.auth.admin
};
