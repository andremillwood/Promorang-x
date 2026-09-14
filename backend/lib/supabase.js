const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// ALWAYS use the Service Role Key for backend operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase Administrative credentials NOT found. Backend operations will fail.');
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function findAuthUserByEmail(email) {
  if (!supabase) return null;
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;

  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const matched = users.find((user) => String(user.email || '').trim().toLowerCase() === normalized);
    if (matched) return matched;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensurePandxtraManchesterHillsClient() {
  if (!supabase) return;

  try {
    const account = await findAuthUserByEmail('pandxtra@gmail.com');
    if (!account?.id) {
      console.warn('[ManagedClientBootstrap] Pandxtra auth account not found; skipping managed client bootstrap.');
      return;
    }

    let { data: agency, error: agencyLookupError } = await supabase
      .from('organizations')
      .select('id, name, slug, type')
      .eq('slug', 'pandxtra')
      .maybeSingle();

    if (agencyLookupError) throw agencyLookupError;

    if (!agency) {
      const { data: createdAgency, error: createAgencyError } = await supabase
        .from('organizations')
        .insert({
          name: 'Pandxtra',
          slug: 'pandxtra',
          type: 'agency',
          created_by: account.id,
        })
        .select('id, name, slug, type')
        .single();
      if (createAgencyError) throw createAgencyError;
      agency = createdAgency;
    }

    await supabase
      .from('organizations')
      .update({
        owner_id: account.id,
        contact_email: 'pandxtra@gmail.com',
        billing_email: 'pandxtra@gmail.com',
        claim_status: 'claimed',
      })
      .eq('id', agency.id);

    const { error: agencyMembershipError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: agency.id,
        user_id: account.id,
        role: 'owner',
      }, { onConflict: 'organization_id,user_id' });
    if (agencyMembershipError) throw agencyMembershipError;

    let { data: client, error: clientLookupError } = await supabase
      .from('organizations')
      .select('id, name, slug, type, website')
      .eq('slug', 'manchester-hills-foods')
      .maybeSingle();

    if (clientLookupError) throw clientLookupError;

    if (!client) {
      const { data: nameMatch, error: nameMatchError } = await supabase
        .from('organizations')
        .select('id, name, slug, type, website')
        .eq('type', 'brand')
        .ilike('name', 'Manchester Hills%')
        .limit(1)
        .maybeSingle();
      if (nameMatchError) throw nameMatchError;
      client = nameMatch || null;
    }

    if (!client) {
      const { data: createdClient, error: createClientError } = await supabase
        .from('organizations')
        .insert({
          name: 'Manchester Hills Foods',
          slug: 'manchester-hills-foods',
          type: 'brand',
          website: 'https://manchesterhillsfoods.com',
          created_by: account.id,
        })
        .select('id, name, slug, type, website')
        .single();

      if (createClientError) {
        if (createClientError.code === '23505') {
          const { data: racedClient, error: racedClientError } = await supabase
            .from('organizations')
            .select('id, name, slug, type, website')
            .eq('slug', 'manchester-hills-foods')
            .single();
          if (racedClientError) throw racedClientError;
          client = racedClient;
        } else {
          throw createClientError;
        }
      } else {
        client = createdClient;
      }
    }

    const { error: clientMembershipError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: client.id,
        user_id: account.id,
        role: 'owner',
      }, { onConflict: 'organization_id,user_id' });
    if (clientMembershipError) throw clientMembershipError;

    const { error: relationshipError } = await supabase
      .from('agency_clients')
      .upsert({
        agency_id: agency.id,
        client_id: client.id,
        relationship_type: 'full_service',
        status: 'active',
      }, { onConflict: 'agency_id,client_id' });
    if (relationshipError) throw relationshipError;

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert([
        { user_id: account.id, role: 'agency', revoked_at: null },
        { user_id: account.id, role: 'brand', revoked_at: null },
      ], { onConflict: 'user_id,role' });
    if (roleError) throw roleError;

    console.log('[ManagedClientBootstrap] Pandxtra -> Manchester Hills Foods is active.');
  } catch (error) {
    console.error('[ManagedClientBootstrap] Failed:', error.message || error);
  }
}

// Test connection silently and ensure required managed-client bootstrap data exists.
if (supabase) {
  supabase.from('users').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) console.error('[Supabase] Auth Bridge connection warning:', error.message);
      else console.log('✅ Supabase Auth Bridge Ready');
    });

  ensurePandxtraManchesterHillsClient();
}

module.exports = { 
  supabase,
  admin: supabase?.auth?.admin || null
};
