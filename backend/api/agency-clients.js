const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');
const roleService = require('../services/roleService');

const CLIENT_TYPES = ['brand', 'merchant'];
const RELATIONSHIP_TYPES = ['full_service', 'partial', 'strategy', 'media', 'activation'];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function dedupeById(rows) {
  const seen = new Map();
  for (const row of rows || []) {
    if (row?.id) seen.set(row.id, row);
  }
  return Array.from(seen.values());
}

async function getMembershipOrganizations(userId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
        id,
        name,
        slug,
        type,
        avatar_url
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    ...(row.organizations || {}),
    membership_role: row.role,
  }));
}

function hasOrgAccess(organizations, orgId, expectedType) {
  return organizations.some((org) => org.id === orgId && (!expectedType || org.type === expectedType));
}

async function getRelationshipRowsForUser(memberOrganizations) {
  const agencyIds = memberOrganizations.filter((org) => org.type === 'agency').map((org) => org.id);
  const clientIds = memberOrganizations.filter((org) => CLIENT_TYPES.includes(org.type)).map((org) => org.id);
  const rows = [];

  if (agencyIds.length > 0) {
    const { data, error } = await supabase
      .from('agency_clients')
      .select('*')
      .in('agency_id', agencyIds)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    rows.push(...(data || []));
  }

  if (clientIds.length > 0) {
    const { data, error } = await supabase
      .from('agency_clients')
      .select('*')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    rows.push(...(data || []));
  }

  return dedupeById(rows);
}

async function hydrateRelationships(rows) {
  if (!rows.length) return [];

  const organizationIds = Array.from(
    new Set(rows.flatMap((row) => [row.agency_id, row.client_id]).filter(Boolean)),
  );

  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('id, name, slug, type, avatar_url')
    .in('id', organizationIds);

  if (error) throw new Error(error.message);

  const organizationMap = new Map((organizations || []).map((org) => [org.id, org]));

  return rows.map((row) => ({
    ...row,
    agency: organizationMap.get(row.agency_id) || null,
    client: organizationMap.get(row.client_id) || null,
  }));
}

async function getAvailableOrganizations(type, searchTerm = '') {
  let query = supabase
    .from('organizations')
    .select('id, name, slug, type, avatar_url')
    .eq('type', type)
    .order('name', { ascending: true })
    .limit(40);

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function buildUniqueSlug(name) {
  const base = slugify(name) || 'organization';
  const candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  return candidate;
}

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.query.agencyId ? String(req.query.agencyId) : null;
    const clientId = req.query.clientId ? String(req.query.clientId) : null;
    const search = req.query.search ? String(req.query.search).trim() : '';
    const memberships = await getMembershipOrganizations(userId);
    const relationships = await hydrateRelationships(await getRelationshipRowsForUser(memberships));

    let availableClients = [];
    let availableAgencies = [];

    if (agencyId && hasOrgAccess(memberships, agencyId, 'agency')) {
      const linkedClientIds = new Set(
        relationships.filter((row) => row.agency_id === agencyId).map((row) => row.client_id),
      );
      const availableBrands = await getAvailableOrganizations('brand', search);
      const availableMerchants = await getAvailableOrganizations('merchant', search);
      availableClients = [...availableBrands, ...availableMerchants].map((org) => ({
        ...org,
        isConnected: linkedClientIds.has(org.id),
      }));
    }

    if (clientId && hasOrgAccess(memberships, clientId)) {
      const linkedAgencyIds = new Set(
        relationships.filter((row) => row.client_id === clientId).map((row) => row.agency_id),
      );
      availableAgencies = (await getAvailableOrganizations('agency', search)).map((org) => ({
        ...org,
        isConnected: linkedAgencyIds.has(org.id),
      }));
    }

    return res.json({
      memberships,
      relationships,
      availableClients,
      availableAgencies,
    });
  } catch (error) {
    console.error('[AgencyClients] GET error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load agency relationships' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      agencyId,
      clientId,
      clientName,
      clientType = 'brand',
      website = null,
      relationshipType = 'full_service',
    } = req.body || {};

    if (!agencyId) {
      return res.status(400).json({ error: 'agencyId is required' });
    }

    if (!hasOrgAccess(await getMembershipOrganizations(userId), agencyId, 'agency')) {
      return res.status(403).json({ error: 'You do not manage this agency workspace' });
    }

    if (!RELATIONSHIP_TYPES.includes(relationshipType)) {
      return res.status(400).json({ error: 'Invalid relationship type' });
    }

    let resolvedClientId = clientId || null;

    if (!resolvedClientId) {
      if (!clientName?.trim() || !CLIENT_TYPES.includes(clientType)) {
        return res.status(400).json({ error: 'clientName and valid clientType are required' });
      }

      const slug = await buildUniqueSlug(clientName);
      const { data: organization, error: organizationError } = await supabase
        .from('organizations')
        .insert({
          name: clientName.trim(),
          slug,
          type: clientType,
          website,
          created_by: userId,
        })
        .select('id, name, slug, type, avatar_url')
        .single();

      if (organizationError) throw organizationError;

      resolvedClientId = organization.id;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: userId,
          role: 'owner',
        });

      if (memberError) {
        console.warn('[AgencyClients] Failed to create owner membership for new client:', memberError.message);
      }

      try {
        await roleService.grantRole(userId, clientType, 'agency_client_bootstrap');
      } catch (roleError) {
        console.warn('[AgencyClients] Failed to grant role for new client workspace:', roleError.message);
      }
    }

    const memberships = await getMembershipOrganizations(userId);
    const userAlsoBelongsToClient = hasOrgAccess(memberships, resolvedClientId);
    const status = userAlsoBelongsToClient ? 'active' : 'pending';

    const { data: relationship, error: relationshipError } = await supabase
      .from('agency_clients')
      .upsert(
        {
          agency_id: agencyId,
          client_id: resolvedClientId,
          relationship_type: relationshipType,
          status,
        },
        { onConflict: 'agency_id,client_id' },
      )
      .select('*')
      .single();

    if (relationshipError) throw relationshipError;

    const [hydrated] = await hydrateRelationships([relationship]);
    return res.status(201).json({ relationship: hydrated });
  } catch (error) {
    console.error('[AgencyClients] POST error:', error);
    return res.status(500).json({ error: error.message || 'Failed to connect client workspace' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const relationshipId = req.params.id;
    const { status, relationshipType } = req.body || {};

    const { data: existing, error: existingError } = await supabase
      .from('agency_clients')
      .select('*')
      .eq('id', relationshipId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return res.status(404).json({ error: 'Relationship not found' });

    const memberships = await getMembershipOrganizations(userId);
    const canManage =
      hasOrgAccess(memberships, existing.agency_id, 'agency') ||
      hasOrgAccess(memberships, existing.client_id);

    if (!canManage) {
      return res.status(403).json({ error: 'You cannot manage this relationship' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (relationshipType && RELATIONSHIP_TYPES.includes(relationshipType)) {
      updates.relationship_type = relationshipType;
    }

    const { data: updated, error: updateError } = await supabase
      .from('agency_clients')
      .update(updates)
      .eq('id', relationshipId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    const [hydrated] = await hydrateRelationships([updated]);
    return res.json({ relationship: hydrated });
  } catch (error) {
    console.error('[AgencyClients] PATCH error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update relationship' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const relationshipId = req.params.id;

    const { data: existing, error: existingError } = await supabase
      .from('agency_clients')
      .select('*')
      .eq('id', relationshipId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) return res.status(404).json({ error: 'Relationship not found' });

    const memberships = await getMembershipOrganizations(userId);
    const canManage =
      hasOrgAccess(memberships, existing.agency_id, 'agency') ||
      hasOrgAccess(memberships, existing.client_id);

    if (!canManage) {
      return res.status(403).json({ error: 'You cannot remove this relationship' });
    }

    const { error: deleteError } = await supabase
      .from('agency_clients')
      .delete()
      .eq('id', relationshipId);

    if (deleteError) throw deleteError;

    return res.json({ success: true, removedId: relationshipId });
  } catch (error) {
    console.error('[AgencyClients] DELETE error:', error);
    return res.status(500).json({ error: error.message || 'Failed to remove relationship' });
  }
});

module.exports = router;
