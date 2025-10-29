const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not found. Running with mock data.');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase backend client initialized successfully');

    // Test database connection
    supabase.from('users').select('count').limit(1).then(({ data, error }) => {
      if (error) {
        console.error('❌ Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful');
      }
    }).catch((error) => {
      console.error('❌ Database connection test failed:', error.message);
    });
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    supabase = null;
  }
}

module.exports = supabase;
