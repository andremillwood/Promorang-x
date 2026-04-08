const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { z } = require('zod');

// Schema for scouting submission
const scoutSchema = z.object({
    url: z.string().url(),
    platform: z.enum(['tiktok', 'instagram', 'youtube', 'other']).optional(),
    title: z.string().optional().default('Scouted Content'),
    thumbnail: z.string().optional()
});

/**
 * Helper to extract platform and ID from URL
 * basic regex implementation for MVP
 */
const parseContentUrl = (url) => {
    let platform = 'other';
    let sourceId = url;

    if (url.includes('tiktok.com')) {
        platform = 'tiktok';
        const match = url.match(/video\/(\d+)/);
        if (match) sourceId = match[1];
    } else if (url.includes('instagram.com')) {
        platform = 'instagram';
        const match = url.match(/reel\/([a-zA-Z0-9_-]+)/) || url.match(/p\/([a-zA-Z0-9_-]+)/);
        if (match) sourceId = match[1];
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube';
        const match = url.match(/v=([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (match) sourceId = match[1];
    }

    return { platform, sourceId };
};

// POST /api/bounty/scout
// Users submit a link they found
router.post('/scout', async (req, res) => {
    try {
        const { url, title, thumbnail } = scoutSchema.parse(req.body);
        const userId = req.user.id;

        const { platform, sourceId } = parseContentUrl(url);

        // 1. Check if already scouted
        if (supabase) {
            const { data: existing, error: checkError } = await supabase
                .from('bounty_scout_records')
                .select('*')
                .eq('source_platform', platform)
                .eq('source_id', sourceId)
                .single();

            if (existing) {
                return res.status(409).json({
                    success: false,
                    error: 'Content already scouted',
                    message: 'This content has already been claimed by another scout!',
                    scout: existing.scout_id === userId ? 'You!' : 'Another Scout'
                });
            }

            // 2. Create placeholder content record (if needed) or linking logic
            // For MVP, we insert a placeholder content_piece or assume it exists. 
            // Ideally, a background job would scrape the content info.

            // Inserting into bounty_scout_records requires a content_id.
            // We first need to create a content_piece record or find one.

            let contentId;

            const { data: newContent, error: contentError } = await supabase
                .from('content_pieces')
                .insert({
                    original_url: url,
                    platform: platform,
                    platform_id: sourceId,
                    title: title,
                    description: 'Scouted via Bounty Hunt',
                    thumbnail_url: thumbnail,
                    media_type: platform === 'youtube' ? 'video' : 'short_video',
                    status: 'pending_verification' // Assumption: status column exists
                })
                .select()
                .single();

            if (contentError) {
                // Fallback if content creation fails (maybe duplicate unique constraint on content_pieces?)
                console.error('Content creation error:', contentError);
                // Try to find existing
                const { data: existingContent } = await supabase.from('content_pieces').select('id').eq('original_url', url).single();
                if (existingContent) contentId = existingContent.id;
                else throw new Error('Failed to create content record');
            } else {
                contentId = newContent.id;
            }

            // 3. Create Scout Record
            const { data: scoutRecord, error: scoutError } = await supabase
                .from('bounty_scout_records')
                .insert({
                    scout_id: userId,
                    content_id: contentId,
                    source_platform: platform,
                    source_id: sourceId,
                    status: 'active',
                    finder_fee_percentage: 5.00
                })
                .select()
                .single();

            if (scoutError) throw scoutError;

            return res.json({
                success: true,
                data: scoutRecord,
                message: 'Bounty claimed successfully! You earned 5% equity.'
            });
        } else {
            // Mock success for dev without Supabase
            return res.json({
                success: true,
                data: {
                    id: 'mock-scout-id',
                    source_platform: platform,
                    source_id: sourceId,
                    status: 'active',
                    finder_fee_percentage: 5.00
                },
                message: 'Bounty claimed successfully! (Mock Mode)'
            });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors[0].message });
        }
        console.error('Scout error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/bounty/trending
// Returns content suggestions for scouting
router.get('/trending', async (req, res) => {
    // In a real app, this might come from a 3rd party API (Apify, etc) or internal crawler
    // For now, we return high-quality mock candidates to simulate the "Hunt" experience.

    const mockTrending = [
        {
            id: 'trend-1',
            thumbnail: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80',
            title: 'Hidden Gem: Tokyo Street Food',
            platform: 'tiktok',
            views: 450000,
            growthRate: 340,
            estimatedValue: '$2.50',
            postedAgo: '2h',
            url: 'https://www.tiktok.com/@foodie/video/123456789'
        },
        {
            id: 'trend-2',
            thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
            title: 'Fitness Hack for Busy Pros',
            platform: 'instagram',
            views: 120000,
            growthRate: 150,
            estimatedValue: '$1.80',
            postedAgo: '5h',
            url: 'https://www.instagram.com/p/abcdef123'
        },
        {
            id: 'trend-3',
            thumbnail: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
            title: 'Solo Travel Survival Guide',
            platform: 'youtube',
            views: 89000,
            growthRate: 410,
            estimatedValue: '$5.00',
            postedAgo: '1d',
            url: 'https://www.youtube.com/watch?v=xyz123'
        }
    ];

    res.json({
        success: true,
        data: mockTrending
    });
});

module.exports = router;
