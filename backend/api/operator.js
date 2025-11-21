const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data = {}, message) => {
  return res.json({ success: true, data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ success: false, error: message, code });
};

const normalizeSlug = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 64);
};

// Public: fetch hub by slug for /club/:hubSlug
router.get('/hubs/:slug', async (req, res) => {
  const rawSlug = req.params.slug;
  const slug = normalizeSlug(rawSlug);

  if (!slug) {
    return sendError(res, 400, 'Invalid hub slug', 'INVALID_SLUG');
  }

  try {
    if (!supabase) {
      // Demo fallback when Supabase is not configured
      return sendSuccess(res, {
        hub: {
          id: 'demo-hub-id',
          slug,
          name: 'Demo Season Hub',
          description: 'This is a demo hub. Connect Supabase to enable live hubs.',
          status: 'active',
          access_type: 'open',
          theme_config: {
            primaryColor: '#7C3AED',
            accentColor: '#FBBF24',
          },
          operator: {
            handle: 'demo_operator',
            display_name: 'Demo Operator',
          },
        },
      });
    }

    const { data: hub, error } = await supabase
      .from('season_hubs')
      .select(`
        id,
        slug,
        name,
        description,
        status,
        access_type,
        theme_config,
        operator:operators(
          handle,
          display_name
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching hub by slug:', error);
      return sendError(res, 500, 'Failed to fetch hub', 'HUB_FETCH_FAILED');
    }

    if (!hub) {
      return sendError(res, 404, 'Hub not found', 'HUB_NOT_FOUND');
    }

    return sendSuccess(res, { hub });
  } catch (err) {
    console.error('Unexpected error in GET /api/operator/hubs/:slug:', err);
    return sendError(res, 500, 'Failed to fetch hub', 'HUB_FETCH_FAILED');
  }
});

// All routes below require authentication and a valid operator profile
router.use(requireAuth);

// GET /api/operator/me - fetch operator profile for the current user
router.get('/me', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 400, 'User context missing', 'USER_CONTEXT_MISSING');
    }

    if (!supabase) {
      // In demo mode, simply indicate that no operator is configured yet
      return sendSuccess(res, { operator: null });
    }

    const { data: operator, error } = await supabase
      .from('operators')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching operator profile:', error);
      return sendError(res, 500, 'Failed to fetch operator profile', 'OPERATOR_FETCH_FAILED');
    }

    return sendSuccess(res, { operator });
  } catch (err) {
    console.error('Unexpected error in GET /api/operator/me:', err);
    return sendError(res, 500, 'Failed to fetch operator profile', 'OPERATOR_FETCH_FAILED');
  }
});

// POST /api/operator - create operator profile for current user
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { handle, display_name: displayName, type } = req.body || {};

    if (!userId) {
      return sendError(res, 400, 'User context missing', 'USER_CONTEXT_MISSING');
    }

    if (!supabase) {
      return sendError(res, 503, 'Operator creation not available in demo mode', 'OPERATOR_DEMO_ONLY');
    }

    const normalizedHandle = normalizeSlug(handle);

    if (!normalizedHandle) {
      return sendError(res, 400, 'Invalid handle', 'INVALID_HANDLE');
    }

    // Ensure this user does not already have an operator profile
    const { data: existingOperator, error: existingError } = await supabase
      .from('operators')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing operator:', existingError);
      return sendError(res, 500, 'Failed to create operator', 'OPERATOR_CREATE_FAILED');
    }

    if (existingOperator) {
      return sendError(res, 400, 'Operator profile already exists for this user', 'OPERATOR_ALREADY_EXISTS');
    }

    // Ensure handle is unique
    const { data: handleConflict, error: handleError } = await supabase
      .from('operators')
      .select('id')
      .eq('handle', normalizedHandle)
      .maybeSingle();

    if (handleError) {
      console.error('Error checking handle uniqueness:', handleError);
      return sendError(res, 500, 'Failed to create operator', 'OPERATOR_CREATE_FAILED');
    }

    if (handleConflict) {
      return sendError(res, 400, 'Handle is already taken', 'HANDLE_TAKEN');
    }

    const now = new Date().toISOString();

    const { data: created, error: insertError } = await supabase
      .from('operators')
      .insert([
        {
          user_id: userId,
          handle: normalizedHandle,
          display_name: displayName || normalizedHandle,
          type: type || 'operator',
          status: 'pending',
          created_at: now,
          updated_at: now,
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting operator:', insertError);
      return sendError(res, 500, 'Failed to create operator', 'OPERATOR_CREATE_FAILED');
    }

    return sendSuccess(res, { operator: created }, 'Operator profile created');
  } catch (err) {
    console.error('Unexpected error in POST /api/operator:', err);
    return sendError(res, 500, 'Failed to create operator', 'OPERATOR_CREATE_FAILED');
  }
});

// Helper to fetch operator for current user
const getOperatorForUser = async (userId) => {
  if (!supabase) return null;

  const { data: operator, error } = await supabase
    .from('operators')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching operator for user:', error);
    throw new Error('OPERATOR_FETCH_FAILED');
  }

  return operator;
};

// GET /api/operator/hubs - list hubs for current operator
router.get('/hubs', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 400, 'User context missing', 'USER_CONTEXT_MISSING');
    }

    if (!supabase) {
      // Demo fallback
      return sendSuccess(res, {
        hubs: [],
      });
    }

    const operator = await getOperatorForUser(userId);

    if (!operator) {
      return sendError(res, 404, 'Operator profile not found', 'OPERATOR_NOT_FOUND');
    }

    const { data: hubs, error } = await supabase
      .from('season_hubs')
      .select('*')
      .eq('operator_id', operator.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching season hubs:', error);
      return sendError(res, 500, 'Failed to fetch hubs', 'HUB_LIST_FAILED');
    }

    return sendSuccess(res, { hubs: hubs || [] });
  } catch (err) {
    console.error('Unexpected error in GET /api/operator/hubs:', err);
    return sendError(res, 500, 'Failed to fetch hubs', 'HUB_LIST_FAILED');
  }
});

// POST /api/operator/hubs - create a new hub for current operator
router.post('/hubs', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { slug: rawSlug, name, description, access_type: accessType } = req.body || {};

    if (!userId) {
      return sendError(res, 400, 'User context missing', 'USER_CONTEXT_MISSING');
    }

    if (!supabase) {
      return sendError(res, 503, 'Hub creation not available in demo mode', 'HUB_CREATE_DEMO_ONLY');
    }

    const slug = normalizeSlug(rawSlug || name);

    if (!slug) {
      return sendError(res, 400, 'Invalid hub slug or name', 'INVALID_HUB_SLUG');
    }

    const operator = await getOperatorForUser(userId);

    if (!operator) {
      return sendError(res, 404, 'Operator profile not found', 'OPERATOR_NOT_FOUND');
    }

    // Ensure slug is unique across all hubs
    const { data: existingHub, error: slugError } = await supabase
      .from('season_hubs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (slugError) {
      console.error('Error checking hub slug uniqueness:', slugError);
      return sendError(res, 500, 'Failed to create hub', 'HUB_CREATE_FAILED');
    }

    if (existingHub) {
      return sendError(res, 400, 'Hub slug is already in use', 'HUB_SLUG_TAKEN');
    }

    const now = new Date().toISOString();

    const { data: created, error: insertError } = await supabase
      .from('season_hubs')
      .insert([
        {
          operator_id: operator.id,
          slug,
          name,
          description: description || null,
          access_type: accessType || 'open',
          status: 'draft',
          created_at: now,
          updated_at: now,
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting season hub:', insertError);
      return sendError(res, 500, 'Failed to create hub', 'HUB_CREATE_FAILED');
    }

    return sendSuccess(res, { hub: created }, 'Season hub created');
  } catch (err) {
    console.error('Unexpected error in POST /api/operator/hubs:', err);
    return sendError(res, 500, 'Failed to create hub', 'HUB_CREATE_FAILED');
  }
});

module.exports = router;
