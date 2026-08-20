const express = require('express');
let supabaseAdmin = null;

try {
  const { supabase } = require('../lib/supabase');
  supabaseAdmin = supabase.supabase || supabase;
} catch (error) {
  console.error('Failed to load supabase from ../lib/supabase:', error.message);
}

const router = express.Router();

const AUTH_SCHEME = 'Bearer ';

const toList = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const DEFAULT_COOLDOWN_DAYS = Number.parseInt(process.env.MANYCHAT_COOLDOWN_DAYS || '30', 10);
const COOLDOWN_DAYS = Number.isFinite(DEFAULT_COOLDOWN_DAYS) && DEFAULT_COOLDOWN_DAYS > 0
  ? DEFAULT_COOLDOWN_DAYS
  : 30;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const fallbackTestEmail = process.env.MANYCHAT_TEST_EMAIL || 'andremillwood@gmail.com';
const fallbackTestInstagram = process.env.MANYCHAT_TEST_INSTAGRAM || 'andremillwood_';

const whitelistEmailValues = new Set(
  [...toList(process.env.MANYCHAT_WHITELIST_EMAILS), fallbackTestEmail]
    .map((entry) => entry.toLowerCase())
    .filter(Boolean)
);

const whitelistInstagramValues = new Set(
  [...toList(process.env.MANYCHAT_WHITELIST_INSTAGRAMS), fallbackTestInstagram]
    .map((entry) => entry.toLowerCase().replace(/^@/, ''))
    .filter(Boolean)
);

/**
 * GET /api/manychat/followers
 * Status and diagnostic check endpoint
 */
router.get('/followers', (req, res) => {
  res.json({
    success: true,
    message: 'ManyChat follower webhook endpoint is active',
    usage: 'POST to this endpoint with Authorization: Bearer <MANYCHAT_SECRET>',
    required_fields: ['instagram', 'followers'],
    optional_fields: ['name', 'email', 'phone', 'user_id'],
    cooldown_days: COOLDOWN_DAYS,
  });
});

/**
 * Helper to determine tier from follower count
 */
function calculateInfluenceTier(followers) {
  if (followers >= 50000) return 'super';
  if (followers >= 10000) return 'premium';
  return 'free';
}

/**
 * POST /api/manychat/followers
 * Webhook invoked by ManyChat DM automation flow
 */
router.post('/followers', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }

  try {
    const authHeader = (req.headers.authorization || '').trim();
    if (!authHeader.startsWith(AUTH_SCHEME)) {
      return res.status(403).json({ error: 'Forbidden: Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(AUTH_SCHEME.length);
    const expectedSecret = process.env.MANYCHAT_SECRET;
    if (!expectedSecret || token !== expectedSecret) {
      return res.status(403).json({ error: 'Forbidden: Invalid ManyChat secret' });
    }

    const { name, email, phone, instagram, followers, user_id } = req.body || {};

    console.log('[ManyChat] Webhook payload received:', {
      name: typeof name === 'string' ? name.trim() : undefined,
      email,
      phone,
      instagram,
      followers,
      user_id,
    });

    const rawInstagram = typeof instagram === 'string' ? instagram : String(instagram || '');
    const normalizedInstagram = rawInstagram.trim().replace(/^@/, '').toLowerCase();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : null;
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : null;
    const sanitizedName = typeof name === 'string' ? name.trim() : '';
    const followerCount = Number(followers);

    if (!normalizedInstagram || Number.isNaN(followerCount)) {
      return res.status(400).json({ error: 'Missing instagram or valid follower count' });
    }

    // Standard points calculation: 10 points per follower
    const followerPoints = Math.max(0, Math.floor(followerCount * 10));
    const calculatedTier = calculateInfluenceTier(followerCount);

    const isEmailWhitelisted = normalizedEmail && whitelistEmailValues.has(normalizedEmail);
    const isInstagramWhitelisted = normalizedInstagram && whitelistInstagramValues.has(normalizedInstagram);
    const isWhitelisted = Boolean(isEmailWhitelisted || isInstagramWhitelisted);

    // 1. Fetch recent sync for cooldown
    let lastSync = null;
    try {
      const { data: syncData, error: syncErr } = await supabaseAdmin
        .from('manychat_syncs')
        .select('synced_at, follower_count, points_awarded, user_id')
        .or(`instagram.ilike.${normalizedInstagram}${normalizedEmail ? `,email.ilike.${normalizedEmail}` : ''}`)
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!syncErr && syncData) {
        lastSync = syncData;
      }
    } catch (err) {
      console.warn('[ManyChat] Error querying manychat_syncs table:', err.message);
    }

    const now = new Date();

    if (!isWhitelisted && lastSync?.synced_at) {
      const lastSyncTime = new Date(lastSync.synced_at);
      const timeSinceLastSync = now.getTime() - lastSyncTime.getTime();

      if (Number.isFinite(timeSinceLastSync) && timeSinceLastSync < COOLDOWN_MS) {
        const nextSyncDate = new Date(lastSyncTime.getTime() + COOLDOWN_MS);
        return res.status(429).json({
          error: 'Too many syncs',
          message: `Followers can only be synced once every ${COOLDOWN_DAYS} days`,
          last_synced_at: lastSync.synced_at,
          next_available_sync_at: nextSyncDate.toISOString(),
          follower_count,
          points_awarded: 0,
        });
      }
    }

    // 2. Find target user in profiles or users
    let matchedUserId = user_id || null;
    let matchedInTable = null;
    let existingProfile = null;

    // Check profiles table first
    if (!matchedUserId && normalizedInstagram) {
      const { data: pData } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, full_name, instagram_username, points_balance, follower_count')
        .ilike('instagram_username', normalizedInstagram)
        .limit(1)
        .maybeSingle();
      if (pData) {
        existingProfile = pData;
        matchedUserId = pData.user_id || pData.id;
        matchedInTable = 'profiles';
      }
    }

    if (!matchedUserId && normalizedEmail) {
      const { data: pData } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, full_name, instagram_username, points_balance, follower_count')
        .ilike('email', normalizedEmail)
        .limit(1)
        .maybeSingle();
      if (pData) {
        existingProfile = pData;
        matchedUserId = pData.user_id || pData.id;
        matchedInTable = 'profiles';
      }
    }

    // Check users table if not found in profiles
    if (!matchedUserId) {
      let uQuery = supabaseAdmin.from('users').select('id, email, username, display_name, points_balance');
      if (normalizedEmail) {
        const { data: uData } = await uQuery.ilike('email', normalizedEmail).limit(1).maybeSingle();
        if (uData) {
          matchedUserId = uData.id;
          matchedInTable = 'users';
          existingProfile = uData;
        }
      }

      if (!matchedUserId && normalizedInstagram) {
        const { data: uData } = await supabaseAdmin
          .from('users')
          .select('id, email, username, display_name, points_balance')
          .or(`username.ilike.${normalizedInstagram},instagram_username.ilike.${normalizedInstagram}`)
          .limit(1)
          .maybeSingle();
        if (uData) {
          matchedUserId = uData.id;
          matchedInTable = 'users';
          existingProfile = uData;
        }
      }
    }

    // If still not found, check auth.users directly by email
    if (!matchedUserId && normalizedEmail) {
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const found = authUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (found) {
          matchedUserId = found.id;
          matchedInTable = 'auth';
        }
      } catch (authErr) {
        console.warn('[ManyChat] Auth listUsers lookup skipped:', authErr.message);
      }
    }

    // 3. Update profile records
    if (matchedUserId) {
      // Update profiles table
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            instagram_username: normalizedInstagram,
            follower_count: followerCount,
            instagram_verified: true,
            influence_tier: calculatedTier,
            ...(followerPoints > 0 ? { points_balance: ((existingProfile?.points_balance || 0) + followerPoints) } : {})
          })
          .or(`user_id.eq.${matchedUserId},id.eq.${matchedUserId}`);
      } catch (pUpdateErr) {
        console.warn('[ManyChat] profiles update error (ignored if columns missing):', pUpdateErr.message);
      }

      // Update users table (if present)
      try {
        await supabaseAdmin
          .from('users')
          .update({
            instagram_username: normalizedInstagram,
            ...(followerPoints > 0 ? { points_balance: ((existingProfile?.points_balance || 0) + followerPoints) } : {})
          })
          .eq('id', matchedUserId);
      } catch (uUpdateErr) {
        console.warn('[ManyChat] users table update error (ignored if schema differs):', uUpdateErr.message);
      }
    }

    // 4. Log to manychat_syncs
    try {
      await supabaseAdmin.from('manychat_syncs').insert([
        {
          user_id: matchedUserId,
          instagram: normalizedInstagram,
          email: normalizedEmail,
          phone: normalizedPhone,
          follower_count: followerCount,
          points_awarded: followerPoints,
          metadata: {
            name: sanitizedName,
            influence_tier: calculatedTier,
            matched_table: matchedInTable,
            whitelisted: isWhitelisted,
          },
          synced_at: now.toISOString(),
        }
      ]);
    } catch (insertErr) {
      console.warn('[ManyChat] Error inserting sync log into manychat_syncs:', insertErr.message);
    }

    console.log(`[ManyChat] ✅ Successfully processed webhook for @${normalizedInstagram}: ${followerCount} followers (${followerPoints} points)`);

    return res.json({
      success: true,
      user_id: matchedUserId,
      instagram: normalizedInstagram,
      follower_count: followerCount,
      points_awarded: followerPoints,
      influence_tier: calculatedTier,
      verified: true,
      cooldown_days: COOLDOWN_DAYS,
      whitelist_bypass: isWhitelisted,
      synced_at: now.toISOString(),
    });
  } catch (error) {
    console.error('[ManyChat] Webhook processing exception:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
