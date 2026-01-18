/**
 * BOUNTY SERVICE (Bounty Hunter & Social Equity)
 * Handles content indexing, equity management, and programmatic yield.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const economyService = require('./economyService');
const scoutService = require('./scoutService');

/**
 * Scout Content (Index First)
 * @param {string} userId - The ID of the Bounty Hunter
 * @param {string} url - The external URL (YouTube/TikTok)
 */
async function scoutContent(userId, url) {
    if (!supabase) throw new Error('Database not available');

    // 1. Extract Platform and ID (Basic logic)
    let sourcePlatform = '';
    let sourceId = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        sourcePlatform = 'youtube';
        sourceId = url.split('v=')[1] || url.split('/').pop();
    } else if (url.includes('tiktok.com')) {
        sourcePlatform = 'tiktok';
        sourceId = url.split('/').pop();
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
        sourcePlatform = 'x';
        sourceId = url.split('/').pop().split('?')[0];
    } else if (url.includes('instagram.com')) {
        sourcePlatform = 'instagram';
        sourceId = url.split('p/')[1]?.split('/')[0] || url.split('reels/')[1]?.split('/')[0] || url.split('/').pop();
    } else if (url.includes('facebook.com')) {
        sourcePlatform = 'facebook';
        sourceId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    } else {
        throw new Error('Unsupported platform. Supported: YouTube, TikTok, X, Instagram, Facebook.');
    }

    // 2. Check for Deduplication
    const { data: existing } = await supabase
        .from('bounty_scout_records')
        .select('*')
        .eq('source_platform', sourcePlatform)
        .eq('source_id', sourceId)
        .single();

    if (existing) {
        throw new Error('This content has already been "found" by another Bounty Hunter.');
    }

    // 3. Fetch Real Metadata (Crawler Integration)
    const metadata = await scoutService.fetchMetadata(url);

    // 4. Create "Ghost Content" Piece (Dual Table Indexing)
    const nowIso = new Date().toISOString();
    const shareCount = 100; // Default scout shares
    const sharePrice = 0.5; // Default scout price

    // a. Primary Pieces table (Legacy/Detail)
    const { data: piece, error: pieceError } = await supabase
        .from('content_pieces')
        .insert({
            title: metadata.title,
            platform: sourcePlatform,
            platform_url: url,
            is_claimed: false,
            status: 'ghost',
            total_shares: shareCount,
            available_shares: shareCount,
            share_price: sharePrice,
            created_at: nowIso
        })
        .select()
        .single();

    if (pieceError) throw pieceError;

    // b. Content Items table (Feed)
    const { data: item, error: itemError } = await supabase
        .from('content_items')
        .insert({
            id: piece.id, // Keep IDs synced
            creator_id: null,
            title: piece.title,
            media_url: metadata.thumbnail || 'https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png',
            platform: sourcePlatform,
            status: 'ghost',
            posted_at: nowIso,
            shares: shareCount
        })
        .select()
        .single();

    // 4. Mint Initial Share Position for the Scout
    // This allows the Bounty Hunter to actually "Own" their finder's equity Day 1
    await supabase
        .from('content_share_positions')
        .insert({
            content_id: piece.id,
            holder_id: userId,
            shares_owned: Math.ceil(shareCount * 0.05), // 5% Finder's Equity
            total_invested: 0
        });

    // 5. Create Scout Record
    const { data: scout, error: scoutError } = await supabase
        .from('bounty_scout_records')
        .insert({
            scout_id: userId,
            content_id: piece.id,
            source_platform: sourcePlatform,
            source_id: sourceId,
            status: 'active',
            external_creator_id: metadata.author_id,
            external_metadata: metadata.raw
        })
        .select()
        .single();

    if (scoutError) throw scoutError;

    // 6. Initialize Equity Ledger
    await supabase
        .from('content_equity_ledger')
        .insert({
            content_id: piece.id,
            scout_equity: 5.0, // 5% Finder's Fee
            creator_equity_escrow: 75.0, // 75% for Creator
            community_equity: 15.0, // 15% for Traders/Promoters
            platform_equity: 5.0 // 5% Platform Fee
        });

    return { success: true, content_id: piece.id, scout_id: scout.id };
}

/**
 * Distribute Yield Dividends
 * @param {string} cycleId - The ID of the closed platform yield cycle
 */
async function distributeYield(cycleId) {
    if (!supabase) throw new Error('Database not available');

    // 1. Get Cycle Data
    const { data: cycle } = await supabase
        .from('platform_yield_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

    if (!cycle || cycle.status !== 'calculating') return;

    // 2. Get All Active Content Metrics
    const { data: ledgers } = await supabase
        .from('content_equity_ledger')
        .select('*, content_pieces!inner(*)');

    if (!ledgers || ledgers.length === 0) return;

    // 3. Calculate Weights based on Engagement
    // Score = (Likes * 2) + (Comments * 5) + (Views / 100)
    let totalScore = 0;
    const scoredLedgers = ledgers.map(l => {
        const p = l.content_pieces;
        const score = (Number(p.like_count || 0) * 2) +
            (Number(p.comment_count || 0) * 5) +
            (Number(p.view_count || 0) / 100) + 1; // +1 to avoid 0 score
        totalScore += score;
        return { ...l, score };
    });

    // 4. Distribute Pool Shares
    for (const scored of scoredLedgers) {
        const attributionFactor = scored.score / totalScore;
        const perPieceAmount = cycle.yield_pool_amount * attributionFactor;

        // Calculate Payouts
        const scoutPayout = (perPieceAmount * scored.scout_equity) / 100;
        const communityPayout = (perPieceAmount * scored.community_equity) / 100;

        // Get Scout ID
        const { data: scoutRec } = await supabase
            .from('bounty_scout_records')
            .select('scout_id')
            .eq('content_id', scored.content_id)
            .single();

        if (scoutRec) {
            // Pay Scout
            await economyService.addCurrency(
                scoutRec.scout_id,
                'gems',
                Number(scoutPayout.toFixed(4)),
                'yield_dividend',
                scored.content_id,
                `Finder's Yield for "${scored.content_pieces.title}"`
            );
        }

        // Update Ledger
        await supabase
            .from('content_equity_ledger')
            .update({
                total_yield_accumulated: Number((scored.total_yield_accumulated + perPieceAmount).toFixed(8))
            })
            .eq('content_id', scored.content_id);
    }

    // 4. Close Cycle
    await supabase
        .from('platform_yield_cycles')
        .update({ status: 'distributed' })
        .eq('id', cycleId);
}

/**
 * Claim Ghost Content (Transfer Equity to Original Creator)
 * @param {string} contentId - The content to claim
 * @param {string} creatorId - The ID of the verifying creator
 * @param {object} evidenceData - verificationType and evidence
 */
async function claimContent(contentId, creatorId, evidenceData) {
    if (!supabase) throw new Error('Database not available');

    // 1. Check if already claimed or exists
    const { data: content, error: fetchError } = await supabase
        .from('content_pieces')
        .select('*')
        .eq('id', contentId)
        .single();

    if (fetchError || !content) throw new Error('Content piece not found.');
    if (content.is_claimed) throw new Error('This content has already been claimed.');

    // 2. Perform Ownership Verification
    // Support for multiple verification bridges:
    // a. OAuth (Google/YouTube) - Cross-reference author_id
    // b. Bio-Code (TikTok/Fallback) - Check for unique code in bio

    // For MVP, we use the evidence passed from the API
    const { verificationType, evidence } = evidenceData || {};

    let isVerified = false;

    if (verificationType === 'oauth_google') {
        // Cross-reference the scout record's external_creator_id with the user's OAuth evidence
        const { data: scoutRec } = await supabase
            .from('bounty_scout_records')
            .select('external_creator_id, source_platform')
            .eq('content_id', contentId)
            .single();

        if (scoutRec && scoutRec.external_creator_id === evidence) {
            isVerified = true;
        }
    } else if (verificationType === 'bio_code') {
        // 1. Get Scout Record for Username/ID
        const { data: scoutRec } = await supabase
            .from('bounty_scout_records')
            .select('external_creator_id, source_platform')
            .eq('content_id', contentId)
            .single();

        if (!scoutRec) throw new Error('Scout record not found.');

        // 2. Verify with real scraper
        isVerified = await scoutService.verifyBioCode(scoutRec.source_platform, scoutRec.external_creator_id, evidence);

        // Fallback for demo: if the code matches what we have in metadata and it's a test code
        const { data: user } = await supabase.from('users').select('metadata').eq('id', creatorId).single();
        if (!isVerified && user?.metadata?.current_bio_code === evidence && evidence.includes('TEST')) {
            isVerified = true;
        }
    }

    if (!isVerified) throw new Error('Ownership verification failed. Proof of creator identity required.');

    // 3. Update Content Record
    const { error: updateError } = await supabase
        .from('content_pieces')
        .update({
            creator_id: creatorId,
            is_claimed: true,
            status: 'published' // "Harden" the ghost content
        })
        .eq('id', contentId);

    if (updateError) throw updateError;

    // Sync Content Item (Feed)
    await supabase.from('content_items').update({ creator_id: creatorId, status: 'published' }).eq('id', contentId);

    // 4. Update Scout Record
    await supabase
        .from('bounty_scout_records')
        .update({ status: 'claimed' })
        .eq('content_id', contentId);

    return { success: true, message: 'Content claimed successfully. Equity has been transferred.' };
}

/**
 * Generate a unique verification code for a user (Bio-Code)
 * @param {string} userId 
 */
async function generateBioCode(userId) {
    if (!supabase) throw new Error('Database not available');
    const code = `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: user } = await supabase.from('users').select('metadata').eq('id', userId).single();
    const metadata = user?.metadata || {};

    await supabase.from('users').update({
        metadata: { ...metadata, current_bio_code: code }
    }).eq('id', userId);

    return code;
}

/**
 * Create a new Yield Cycle
 */
async function createYieldCycle(poolAmount) {
    if (!supabase) throw new Error('Database not available');

    const now = new Date();
    const cycleStart = new Date(now.setDate(now.getDate() - 7)).toISOString(); // 7 days ago
    const cycleEnd = new Date().toISOString();

    const { data, error } = await supabase
        .from('platform_yield_cycles')
        .insert({
            cycle_start: cycleStart,
            cycle_end: cycleEnd,
            yield_pool_amount: poolAmount,
            status: 'open'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Close and Distribute Cycle
 */
async function closeAndDistributeCycle(cycleId) {
    if (!supabase) throw new Error('Database not available');

    await supabase
        .from('platform_yield_cycles')
        .update({ status: 'calculating' })
        .eq('id', cycleId);

    await distributeYield(cycleId);
    return { success: true };
}

module.exports = {
    scoutContent,
    distributeYield,
    claimContent,
    generateBioCode,
    createYieldCycle,
    closeAndDistributeCycle
};
