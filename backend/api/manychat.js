const express = require('express');
let supabaseAdmin = null;

try {
  const supabase = require('../lib/supabase');
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

// GET handler for status checking
router.get('/followers', (req, res) => {
  res.json({
    success: true,
    message: 'ManyChat follower webhook endpoint is active',
    usage: 'POST to this endpoint with Authorization: Bearer <MANYCHAT_SECRET>',
    required_fields: ['instagram', 'followers'],
    optional_fields: ['name', 'email', 'phone']
  });
});

// POST handler for ManyChat webhook
router.post('/followers', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }

  try {
    const authHeader = (req.headers.authorization || '').trim();
    if (!authHeader.startsWith(AUTH_SCHEME)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const token = authHeader.substring(AUTH_SCHEME.length);
    if (!process.env.MANYCHAT_SECRET || token !== process.env.MANYCHAT_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('ManyChat webhook invoked', {
      supabaseUrl: process.env.SUPABASE_URL,
      serviceKeyDefined: Boolean(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
      environment: process.env.NODE_ENV,
    });

    const { name, email, phone, instagram, followers } = req.body || {};

    console.log('ManyChat payload received:', {
      name: typeof name === 'string' ? name.trim() : undefined,
      email,
      phone,
      instagram,
      followers,
    });

    const rawInstagram = typeof instagram === 'string' ? instagram : String(instagram || '');
    const normalizedInstagram = rawInstagram.trim().replace(/^@/, '').toLowerCase();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : null;
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : null;
    const sanitizedName = typeof name === 'string' ? name.trim() : '';
    const followerCount = Number(followers);

    if (!normalizedInstagram || Number.isNaN(followerCount)) {
      return res.status(400).json({ error: 'Missing instagram or follower count' });
    }

    const followerPoints = Math.max(0, followerCount * 10);

    const isEmailWhitelisted = normalizedEmail && whitelistEmailValues.has(normalizedEmail);
    const isInstagramWhitelisted = normalizedInstagram && whitelistInstagramValues.has(normalizedInstagram);
    const isWhitelisted = Boolean(isEmailWhitelisted || isInstagramWhitelisted);

    const isMissingTableError = (error) => {
      if (!error) return false;
      const code = error.code || '';
      const message = (error.message || '').toLowerCase();
      return code === 'PGRST201'
        || code === 'PGRST301'
        || code === 'PGRST204'
        || message.includes('does not exist')
        || message.includes('not exist')
        || message.includes('unknown relation');
    };

    let syncTableAvailable = true;

    const fetchLastSync = async (userId) => {
      if (!syncTableAvailable || !userId) {
        return null;
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('manychat_syncs')
          .select('synced_at, follower_count, points_awarded')
          .eq('user_id', userId)
          .order('synced_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          if (isMissingTableError(error)) {
            console.warn('ManyChat: sync log table missing, skipping cooldown enforcement');
            syncTableAvailable = false;
            return null;
          }

          console.error('ManyChat: failed to fetch sync log', {
            userId,
            error,
          });
          return null;
        }

        return data || null;
      } catch (error) {
        console.error('ManyChat: unexpected sync log fetch error', {
          userId,
          error,
        });
        return null;
      }
    };

    const recordSync = async ({ userId, followerCount: syncFollowerCount, pointsAwarded, emailValue, instagramValue, timestamp }) => {
      if (!syncTableAvailable || !userId) {
        return;
      }

      try {
        const { error } = await supabaseAdmin
          .from('manychat_syncs')
          .insert([
            {
              user_id: userId,
              synced_at: timestamp,
              follower_count: syncFollowerCount,
              points_awarded: pointsAwarded,
              email: emailValue,
              instagram: instagramValue,
            },
          ]);

        if (error) {
          if (isMissingTableError(error)) {
            console.warn('ManyChat: sync log table missing during insert, disabling logging');
            syncTableAvailable = false;
            return;
          }

          console.error('ManyChat: failed to insert sync log', {
            userId,
            error,
          });
        }
      } catch (error) {
        console.error('ManyChat: unexpected sync log insert error', {
          userId,
          error,
        });
      }
    };

    const findUser = async (field, value) => {
      if (!value) {
        return null;
      }

      try {
        const query = supabaseAdmin
          .from('users')
          .select('id, email, username, display_name, points_balance');

        const caseInsensitiveFields = ['email', 'instagram_username'];
        const builder = caseInsensitiveFields.includes(field)
          ? query.ilike(field, value)
          : query.eq(field, value);

        const limitedBuilder = builder.limit(1);

        const response = limitedBuilder.maybeSingle
          ? await limitedBuilder.maybeSingle()
          : await limitedBuilder.single();

        if (response.error && response.error.code !== 'PGRST116' && response.error.code !== 'PGRST103') {
          console.warn('ManyChat: Supabase lookup error', {
            field,
            value,
            error: response.error,
          });
          return null;
        }

        if (!response.data) {
          console.log('ManyChat: No user match for field', { field, value });
        }

        return response.data || null;
      } catch (lookupError) {
        console.error('ManyChat: Unexpected lookup error', {
          field,
          value,
          error: lookupError,
        });
        return null;
      }
    };

    let existingUser = null;

    if (normalizedEmail) {
      console.log('ManyChat: looking up by email', normalizedEmail);
      existingUser = await findUser('email', normalizedEmail);
    }

    if (!existingUser) {
      console.log('ManyChat: looking up by username', normalizedInstagram);
      existingUser = await findUser('username', normalizedInstagram);
    }

    if (!existingUser) {
      console.log('ManyChat: looking up by instagram_username', normalizedInstagram);
      existingUser = await findUser('instagram_username', normalizedInstagram);
    }

    if (!existingUser) {
      console.warn('ManyChat: No matching existing user found', {
        normalizedEmail,
        normalizedInstagram,
      });
      return res.status(404).json({
        error: 'User not found',
        message: 'Create the user in Supabase before syncing from ManyChat',
      });
    }

    const lastSync = await fetchLastSync(existingUser.id);
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

    const updates = {};

    if (normalizedEmail && normalizedEmail !== existingUser.email) {
      updates.email = normalizedEmail;
    }

    if (normalizedInstagram && normalizedInstagram !== existingUser.username) {
      updates.username = normalizedInstagram;
    }

    if (sanitizedName && sanitizedName !== existingUser.display_name) {
      updates.display_name = sanitizedName;
    }

    if (followerPoints > 0) {
      updates.points_balance = Math.max(0, (existingUser.points_balance || 0) + followerPoints);
    }

    let updatedUser = existingUser;

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', existingUser.id)
        .select('id, email, username, display_name, points_balance')
        .single();

      console.log('Supabase update result:', data, error);

      if (error) {
        console.error('Failed to update user via ManyChat:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          updates,
        });
        return res.status(500).json({
          error: 'Failed to update user',
          supabase: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          }
        });
      }

      updatedUser = data;
    }

    await recordSync({
      userId: updatedUser.id,
      followerCount: followerCount,
      pointsAwarded: followerPoints,
      emailValue: normalizedEmail,
      instagramValue: normalizedInstagram,
      timestamp: now.toISOString(),
    });

    return res.json({
      success: true,
      points_awarded: followerPoints,
      user_id: updatedUser.id,
      follower_count: followerCount,
      points_balance: updatedUser.points_balance,
      updated_profile: Object.keys(updates).length > 0,
      matched_email: normalizedEmail,
      matched_instagram: normalizedInstagram,
      cooldown_days: COOLDOWN_DAYS,
      whitelist_bypass: isWhitelisted,
      last_sync: lastSync?.synced_at || null,
      sync_logged: syncTableAvailable,
    });
  } catch (error) {
    console.error('ManyChat follower webhook error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
