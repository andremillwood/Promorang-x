const express = require('express');
const supabase = require('../lib/supabase');

const router = express.Router();

router.post('/followers', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not initialized' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.MANYCHAT_SECRET}`) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email, phone, instagram, followers } = req.body || {};
    const followerCount = Number(followers);

    if (!instagram || Number.isNaN(followerCount)) {
      return res.status(400).json({ error: 'Missing instagram or follower count' });
    }

    let existingUser = null;
    if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch existing user:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      existingUser = data || null;
    }

    const followerPoints = Math.floor(followerCount * 0.01);

    let userId = existingUser?.id;
    if (!existingUser) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          phone,
          instagram_username: instagram
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      userId = data.id;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        follower_count: followerCount,
        influence_points: followerPoints,
        total_points: supabase.raw(`coalesce(total_points, 0) + ${followerPoints}`)
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user follower metrics:', updateError);
      return res.status(500).json({ error: 'Failed to update user follower metrics' });
    }

    return res.json({ success: true, points_awarded: followerPoints });
  } catch (error) {
    console.error('ManyChat follower webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
