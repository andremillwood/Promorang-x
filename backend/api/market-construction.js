// Express router for Market Construction API endpoints
// Endpoints for Discoveries Voting, PromoKey Claims, Scene Feeds, and Stakeholder Leads

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// 1. GET ALL SCENES
router.get('/scenes', async (req, res) => {
  try {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching scenes:', err);
    res.status(500).json({ error: 'Failed to fetch scenes' });
  }
});

// 2. GET SCENE DETAIL BY SLUG
router.get('/scenes/:slug', async (req, res) => {
  try {
    if (!supabase) return res.status(404).json({ error: 'Scene not found' });
    const { slug } = req.params;
    const { data: scene, error: sceneError } = await supabase
      .from('scenes')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (sceneError) throw sceneError;
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const { data: discoveries, error: discError } = await supabase
      .from('discovery_questions')
      .select('*')
      .eq('scene_id', scene.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (discError) throw discError;

    res.json({
      scene,
      discoveries: discoveries || []
    });
  } catch (err) {
    console.error('Error fetching scene detail:', err);
    res.status(500).json({ error: 'Failed to fetch scene detail' });
  }
});

// 3. VOTE ON DISCOVERY QUESTION
router.post('/discoveries/:id/vote', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database unavailable' });
    const { id } = req.params;
    const { optionId, userId } = req.body;

    if (!optionId || !userId) {
      return res.status(400).json({ error: 'optionId and userId are required' });
    }

    // Increment option vote count using rpc or fetch-update
    const { data: opt } = await supabase
      .from('discovery_options')
      .select('votes_count')
      .eq('id', optionId)
      .maybeSingle();

    if (opt) {
      await supabase
        .from('discovery_options')
        .update({ votes_count: (opt.votes_count || 0) + 1 })
        .eq('id', optionId);
    }

    // Fetch and update question
    const { data: question } = await supabase
      .from('discovery_questions')
      .select('total_votes, threshold_for_moment')
      .eq('id', id)
      .maybeSingle();

    const newTotal = (question?.total_votes || 0) + 1;
    const isTriggered = newTotal >= (question?.threshold_for_moment || 100);

    await supabase
      .from('discovery_questions')
      .update({
        total_votes: newTotal,
        ...(isTriggered ? { is_moment_triggered: true } : {})
      })
      .eq('id', id);

    res.json({
      success: true,
      totalVotes: newTotal,
      isMomentTriggered: isTriggered
    });
  } catch (err) {
    console.error('Error recording discovery vote:', err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// 4. CLAIM PROMOKEY
router.post('/promokeys/claim', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database unavailable' });
    const { momentId, userId, perkDescription, venueName } = req.body;

    if (!userId || !perkDescription || !venueName) {
      return res.status(400).json({ error: 'Missing required claim parameters' });
    }

    const promoCode = `KEY-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Expires in 1 hour

    const { data, error } = await supabase
      .from('promokey_claims')
      .insert([{
        moment_id: momentId || null,
        user_id: userId,
        promo_code: promoCode,
        perk_description: perkDescription,
        venue_name: venueName,
        expires_at: expiresAt
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      claim: data
    });
  } catch (err) {
    console.error('Error claiming PromoKey:', err);
    res.status(500).json({ error: 'Failed to claim PromoKey' });
  }
});

// 5. VERIFY & REDEEM PROMOKEY (MERCHANT SCANNER)
router.post('/promokeys/verify', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database unavailable' });
    const { promoCode } = req.body;

    if (!promoCode) {
      return res.status(400).json({ error: 'promoCode is required' });
    }

    const { data: claim, error } = await supabase
      .from('promokey_claims')
      .select('*')
      .eq('promo_code', promoCode.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!claim) {
      return res.json({ status: 'INVALID' });
    }

    if (claim.is_redeemed) {
      return res.json({ status: 'REDEEMED', claim });
    }

    if (new Date(claim.expires_at) < new Date()) {
      return res.json({ status: 'EXPIRED', claim });
    }

    // Mark as redeemed
    const { data: updated, error: updateError } = await supabase
      .from('promokey_claims')
      .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', claim.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      status: 'VALID',
      claim: updated
    });
  } catch (err) {
    console.error('Error verifying PromoKey:', err);
    res.status(500).json({ error: 'Failed to verify PromoKey' });
  }
});

// 6. CREATE STAKEHOLDER CRM LEAD
router.post('/crm/leads', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database unavailable' });
    const { name, category, contactPerson, phone, email, objective, sceneAffinity, offPeakCapacityPerk } = req.body;

    const { data, error } = await supabase
      .from('marketplace_crm_leads')
      .insert([{
        name,
        category,
        contact_person: contactPerson,
        phone,
        email,
        objective,
        scene_affinity: sceneAffinity,
        off_peak_capacity_perk: offPeakCapacityPerk
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      lead: data
    });
  } catch (err) {
    console.error('Error creating CRM lead:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

module.exports = router;
