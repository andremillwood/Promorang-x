// Express router for Market Construction API endpoints
// Endpoints for Discoveries Voting, PromoKey Claims, Scene Feeds, and Stakeholder Leads

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // DB pool connection

// 1. GET ALL SCENES
router.get('/scenes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.scenes WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching scenes:', err);
    res.status(500).json({ error: 'Failed to fetch scenes' });
  }
});

// 2. GET SCENE DETAIL BY SLUG
router.get('/scenes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const sceneResult = await pool.query('SELECT * FROM public.scenes WHERE slug = $1', [slug]);
    
    if (sceneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const scene = sceneResult.rows[0];
    const discoveriesResult = await pool.query(
      'SELECT * FROM public.discovery_questions WHERE scene_id = $1 ORDER BY created_at DESC LIMIT 10',
      [scene.id]
    );

    res.json({
      scene,
      discoveries: discoveriesResult.rows
    });
  } catch (err) {
    console.error('Error fetching scene detail:', err);
    res.status(500).json({ error: 'Failed to fetch scene detail' });
  }
});

// 3. VOTE ON DISCOVERY QUESTION
router.post('/discoveries/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { optionId, userId } = req.body;

    if (!optionId || !userId) {
      return res.status(400).json({ error: 'optionId and userId are required' });
    }

    // Increment option vote count
    await pool.query(
      'UPDATE public.discovery_options SET votes_count = votes_count + 1 WHERE id = $1',
      [optionId]
    );

    // Increment discovery question total votes
    const discoveryResult = await pool.query(
      'UPDATE public.discovery_questions SET total_votes = total_votes + 1 WHERE id = $1 RETURNING total_votes, threshold_for_moment',
      [id]
    );

    const discovery = discoveryResult.rows[0];
    const isTriggered = discovery.total_votes >= discovery.threshold_for_moment;

    if (isTriggered) {
      await pool.query(
        'UPDATE public.discovery_questions SET is_moment_triggered = TRUE WHERE id = $1',
        [id]
      );
    }

    res.json({
      success: true,
      totalVotes: discovery.total_votes,
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
    const { momentId, userId, perkDescription, venueName } = req.body;

    if (!userId || !perkDescription || !venueName) {
      return res.status(400).json({ error: 'Missing required claim parameters' });
    }

    const promoCode = `KEY-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Expires in 1 hour

    const result = await pool.query(
      `INSERT INTO public.promokey_claims 
        (moment_id, user_id, promo_code, perk_description, venue_name, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [momentId || null, userId, promoCode, perkDescription, venueName, expiresAt]
    );

    res.json({
      success: true,
      claim: result.rows[0]
    });
  } catch (err) {
    console.error('Error claiming PromoKey:', err);
    res.status(500).json({ error: 'Failed to claim PromoKey' });
  }
});

// 5. VERIFY & REDEEM PROMOKEY (MERCHANT SCANNER)
router.post('/promokeys/verify', async (req, res) => {
  try {
    const { promoCode } = req.body;

    if (!promoCode) {
      return res.status(400).json({ error: 'promoCode is required' });
    }

    const result = await pool.query(
      'SELECT * FROM public.promokey_claims WHERE promo_code = $1',
      [promoCode.trim().toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'INVALID' });
    }

    const claim = result.rows[0];

    if (claim.is_redeemed) {
      return res.json({ status: 'REDEEMED', claim });
    }

    if (new Date(claim.expires_at) < new Date()) {
      return res.json({ status: 'EXPIRED', claim });
    }

    // Mark as redeemed
    await pool.query(
      'UPDATE public.promokey_claims SET is_redeemed = TRUE, redeemed_at = NOW() WHERE id = $1',
      [claim.id]
    );

    res.json({
      status: 'VALID',
      claim
    });
  } catch (err) {
    console.error('Error verifying PromoKey:', err);
    res.status(500).json({ error: 'Failed to verify PromoKey' });
  }
});

// 6. CREATE STAKEHOLDER CRM LEAD
router.post('/crm/leads', async (req, res) => {
  try {
    const { name, category, contactPerson, phone, email, objective, sceneAffinity, offPeakCapacityPerk } = req.body;

    const result = await pool.query(
      `INSERT INTO public.marketplace_crm_leads
        (name, category, contact_person, phone, email, objective, scene_affinity, off_peak_capacity_perk)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, category, contactPerson, phone, email, objective, sceneAffinity, offPeakCapacityPerk]
    );

    res.json({
      success: true,
      lead: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating CRM lead:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

module.exports = router;
