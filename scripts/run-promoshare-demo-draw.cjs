const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { supabase } = require('../backend/lib/supabase');
const promoShareService = require('../backend/services/promoShareService');

async function findDemoCycle() {
  const { data, error } = await supabase
    .from('promoshare_cycles')
    .select('*')
    .eq('status', 'active')
    .filter('config->>demo_name', 'eq', 'super_admin_promoshare_demo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function main() {
  if (!supabase) {
    throw new Error('Missing Supabase service credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const cycle = await findDemoCycle();
  if (!cycle) {
    throw new Error('No active PromoShare demo cycle found. Run supabase/migrations/202606180001_promoshare_super_admin_demo_flow.sql first.');
  }

  const result = await promoShareService.executeTieredDraw(cycle.id, {
    weighted_random: {
      percentage: 100,
      count: 3,
      eligible: true
    }
  });

  const { data: auditRows } = await supabase
    .from('promoshare_draw_audits')
    .select('id, cycle_id, selected_winner_count, one_win_per_user, created_at')
    .eq('cycle_id', cycle.id)
    .order('created_at', { ascending: false })
    .limit(3);

  console.log(JSON.stringify({
    cycle_id: cycle.id,
    winners: result?.winners?.length || 0,
    message: result?.message || 'Demo draw executed.',
    draw_audits: auditRows || []
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
