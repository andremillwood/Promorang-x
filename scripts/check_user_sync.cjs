const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env.local' });

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const result = await s.auth.admin.listUsers({ perPage: 20 });
  const allUsers = result.data?.users || [];
  const nonDemo = allUsers.filter(u => !u.email?.includes('demo.'));
  
  console.log('--- Real (non-demo) auth.users ---');
  for (const u of nonDemo) {
    console.log(u.id, u.email);
  }

  if (nonDemo.length > 0) {
    const ids = nonDemo.map(u => u.id);
    const { data, error } = await s.from('users').select('id, email').in('id', ids);
    console.log('\n--- Matched in public.users ---');
    console.log('Found:', data ? data.length : 0, 'of', ids.length);
    if (data) {
      for (const u of data) {
        console.log('  ', u.id, u.email);
      }
    }
    if (error) console.log('Query Error:', error.message);

    // Show which ones are MISSING
    if (data) {
      const foundIds = new Set(data.map(u => u.id));
      const missing = nonDemo.filter(u => !foundIds.has(u.id));
      if (missing.length > 0) {
        console.log('\n--- MISSING from public.users (auth user exists but no profile) ---');
        for (const u of missing) {
          console.log('  MISSING:', u.id, u.email);
        }
      }
    }
  }
}

main().catch(console.error);
