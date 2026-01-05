const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../lib/auth');

// Apply auth middleware
router.use(authMiddleware);

// Get referral stats for current user
router.get('/stats', async (req, res) => {
    try {
        if (!supabase) {
            // Return demo data
            return res.json({
                success: true,
                data: {
                    summary: {
                        total_referrals: 5,
                        active_referrals: 3,
                        pending_referrals: 2,
                        conversion_rate: '60.0',
                        total_earnings: {
                            usd: 25.50,
                            gems: 150,
                            points: 500
                        },
                        referral_code: generateReferralCode(req.user.id),
                        tier: {
                            tier_name: 'Silver',
                            tier_level: 2,
                            commission_rate: 0.06,
                            badge_icon: '🥈',
                            badge_color: '#C0C0C0'
                        }
                    },
                    referrals: [
                        {
                            id: 1,
                            referred_user: { username: 'new_user_1', display_name: 'New User 1' },
                            status: 'active',
                            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                            earnings: { gems: 30, points: 100 }
                        },
                        {
                            id: 2,
                            referred_user: { username: 'new_user_2', display_name: 'New User 2' },
                            status: 'active',
                            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                            earnings: { gems: 50, points: 150 }
                        }
                    ],
                    recent_commissions: [
                        {
                            id: 1,
                            amount: 30,
                            currency: 'gems',
                            source: 'referral_signup',
                            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ]
                }
            });
        }

        // Get user's referral code or create one
        let { data: referralData, error: referralError } = await supabase
            .from('user_referrals')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (referralError && referralError.code !== 'PGRST116') {
            console.error('Error fetching referral data:', referralError);
        }

        // If no referral code exists, create one
        if (!referralData) {
            const { data: newReferral, error: createError } = await supabase
                .from('user_referrals')
                .insert({
                    user_id: req.user.id,
                    referral_code: generateReferralCode(req.user.id),
                    tier_level: 1
                })
                .select()
                .single();

            if (!createError) {
                referralData = newReferral;
            }
        }

        // Get referral counts
        const { data: referrals, error: refError } = await supabase
            .from('referrals')
            .select('*, referred_user:referred_user_id(username, display_name)')
            .eq('referrer_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        // Get commission history
        const { data: commissions, error: commError } = await supabase
            .from('referral_commissions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        const activeReferrals = (referrals || []).filter(r => r.status === 'active').length;
        const pendingReferrals = (referrals || []).filter(r => r.status === 'pending').length;
        const totalReferrals = (referrals || []).length;

        res.json({
            success: true,
            data: {
                summary: {
                    total_referrals: totalReferrals,
                    active_referrals: activeReferrals,
                    pending_referrals: pendingReferrals,
                    conversion_rate: totalReferrals > 0 ? ((activeReferrals / totalReferrals) * 100).toFixed(1) : '0.0',
                    total_earnings: referralData?.total_earnings || { usd: 0, gems: 0, points: 0 },
                    referral_code: referralData?.referral_code || null,
                    tier: {
                        tier_name: ['Bronze', 'Silver', 'Gold'][Math.min((referralData?.tier_level || 1) - 1, 2)],
                        tier_level: referralData?.tier_level || 1,
                        commission_rate: [0.05, 0.06, 0.075][Math.min((referralData?.tier_level || 1) - 1, 2)],
                        badge_icon: ['🥉', '🥈', '🥇'][Math.min((referralData?.tier_level || 1) - 1, 2)],
                        badge_color: ['#CD7F32', '#C0C0C0', '#FFD700'][Math.min((referralData?.tier_level || 1) - 1, 2)]
                    }
                },
                referrals: referrals || [],
                recent_commissions: commissions || []
            }
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral stats' });
    }
});

// Get referral tiers
router.get('/tiers', (req, res) => {
    res.json({
        success: true,
        data: {
            tiers: [
                {
                    tier_name: 'Bronze',
                    tier_level: 1,
                    min_referrals: 0,
                    commission_rate: 0.05,
                    badge_icon: '🥉',
                    badge_color: '#CD7F32',
                    perks: ['5% commission on referral earnings', 'Basic referral tracking']
                },
                {
                    tier_name: 'Silver',
                    tier_level: 2,
                    min_referrals: 10,
                    commission_rate: 0.06,
                    badge_icon: '🥈',
                    badge_color: '#C0C0C0',
                    perks: ['6% commission on referral earnings', 'Priority support', 'Custom referral link']
                },
                {
                    tier_name: 'Gold',
                    tier_level: 3,
                    min_referrals: 50,
                    commission_rate: 0.075,
                    badge_icon: '🥇',
                    badge_color: '#FFD700',
                    perks: ['7.5% commission on referral earnings', 'VIP support', 'Featured referrer badge', 'Early access to features']
                }
            ]
        }
    });
});

// Apply referral code during signup
router.post('/apply', async (req, res) => {
    try {
        const { referral_code } = req.body;

        if (!referral_code) {
            return res.status(400).json({ success: false, error: 'Referral code is required' });
        }

        if (!supabase) {
            return res.json({ success: true, message: 'Referral code applied (demo mode)' });
        }

        // Find the referrer
        const { data: referrer, error: refError } = await supabase
            .from('user_referrals')
            .select('user_id')
            .eq('referral_code', referral_code.toUpperCase())
            .single();

        if (refError || !referrer) {
            return res.status(400).json({ success: false, error: 'Invalid referral code' });
        }

        // Can't refer yourself
        if (referrer.user_id === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot use your own referral code' });
        }

        // Check if already referred
        const { data: existingRef } = await supabase
            .from('referrals')
            .select('id')
            .eq('referred_user_id', req.user.id)
            .single();

        if (existingRef) {
            return res.status(400).json({ success: false, error: 'Already applied a referral code' });
        }

        // Create referral record
        const { error: createError } = await supabase
            .from('referrals')
            .insert({
                referrer_id: referrer.user_id,
                referred_user_id: req.user.id,
                status: 'pending'
            });

        if (createError) {
            console.error('Error creating referral:', createError);
            return res.status(500).json({ success: false, error: 'Failed to apply referral code' });
        }

        res.json({ success: true, message: 'Referral code applied successfully' });
    } catch (error) {
        console.error('Error applying referral code:', error);
        res.status(500).json({ success: false, error: 'Failed to apply referral code' });
    }
});

module.exports = router;
