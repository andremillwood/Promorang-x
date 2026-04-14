const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Checking for missing tables...');
  
  const tables = [
    'user_roles',
    'host_applications',
    'user_brand_points',
    'point_transactions',
    'users',
    'moments',
    'moment_participants',
    'check_ins'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.code === '42P01') {
        console.log(`❌ Table ${table} NOT FOUND`);
      } else {
        console.log(`⚠️ Error checking ${table}: ${error.code} - ${error.message}`);
      }
    } else {
      console.log(`✅ Table ${table} EXISTS`);
      if (table === 'users' && data && data.length > 0) {
        const first = data[0];
        const required = ['points_balance', 'gems_balance', 'keys_balance'];
        required.forEach(col => {
          if (first[col] === undefined) console.log(`   ❌ Column public.users.${col} MISSING`);
          else console.log(`   ✅ Column public.users.${col} EXISTS`);
        });
      }
    }
  }

  console.log('\nChecking for missing RPCs...');
  const { data: rpcData, error: rpcError } = await supabase.rpc('user_has_role', { 
    p_user_id: '00000000-0000-0000-0000-000000000000', 
    p_role: 'participant' 
  });
  
  if (rpcError) {
    console.log(`❌ RPC user_has_role NOT FOUND or failing: ${rpcError.message}`);
  } else {
    console.log(`✅ RPC user_has_role EXISTS`);
  }
}

checkSchema();
