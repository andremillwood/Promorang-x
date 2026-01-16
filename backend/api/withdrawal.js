const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { getUserProfile } = require('./mockStore');
const { sendWithdrawalRequestedEmail } = require('../services/resendService');

router.use(requireAuth);

/**
 * GET /api/withdrawal/methods
 * List available withdrawal methods
 */
router.get('/methods', (req, res) => {
    const methods = [
        {
            method_name: 'stripe',
            display_name: 'Stripe Payout',
            is_active: true,
            processing_time: '1-3 business days',
            fee_percentage: 2.5,
            min_amount: 50,
            currency: 'usd',
            required_fields: JSON.stringify(['account_holder_name', 'country'])
        },
        {
            method_name: 'paypal',
            display_name: 'PayPal',
            is_active: true,
            processing_time: 'Instant',
            fee_percentage: 3.5,
            min_amount: 20,
            currency: 'usd',
            required_fields: JSON.stringify(['email_address'])
        },
        {
            method_name: 'crypto_usdc',
            display_name: 'USDC Transfer',
            is_active: true,
            processing_time: '10-30 minutes',
            fee_percentage: 1.0,
            min_amount: 100,
            currency: 'usdc',
            required_fields: JSON.stringify(['wallet_address', 'network'])
        }
    ];
    res.json(methods);
});

/**
 * POST /api/withdrawal/request
 * Submit a withdrawal request
 */
router.post('/request', async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, payment_method, payment_details } = req.body;

        if (!amount || amount < 20) {
            return res.status(400).json({ error: 'Invalid amount (min $20)' });
        }

        // 1. Check for KYC if amount > $500
        if (amount > 500) {
            let userKycStatus = 'none';

            if (supabase) {
                const { data: user, error } = await supabase
                    .from('users')
                    .select('kyc_status')
                    .eq('id', userId)
                    .single();

                if (!error && user) {
                    userKycStatus = user.kyc_status || 'none';
                }
            } else {
                // Mock fallback
                const profile = getUserProfile(userId);
                userKycStatus = profile?.kyc_status || 'none';
            }

            if (userKycStatus !== 'verified') {
                return res.status(403).json({
                    error: 'Identity Verification Required',
                    code: 'KYC_REQUIRED',
                    message: 'Withdrawals over $500 require identity verification.'
                });
            }
        }

        // 2. Process Withdrawal (Mock / DB)
        if (supabase) {
            // Deduct balance logic would go here (transaction)
            // For now, we'll just log an insert to a withdrawals table (if it existed)
            // or just return success since we are focusing on the KYC gate.

            // Check Balance
            const { data: user } = await supabase
                .from('users')
                .select('gems_balance')
                .eq('id', userId)
                .single();

            if (user && user.gems_balance < amount) {
                return res.status(400).json({ error: 'Insufficient funds' });
            }

            // TODO: Create withdrawal record in DB

            // Send confirmation email (async)
            const { data: userData } = await supabase
                .from('users')
                .select('email, display_name, username')
                .eq('id', userId)
                .single();

            if (userData?.email) {
                const methods = {
                    stripe: { name: 'Stripe Payout', time: '1-3 business days' },
                    paypal: { name: 'PayPal', time: 'Instant' },
                    crypto_usdc: { name: 'USDC Transfer', time: '10-30 minutes' }
                };
                const methodInfo = methods[payment_method] || { name: payment_method, time: '1-3 business days' };

                sendWithdrawalRequestedEmail(userData.email, userData.display_name || userData.username, {
                    amount,
                    paymentMethod: methodInfo.name,
                    estimatedTime: methodInfo.time,
                }).catch(err => console.error('Failed to send withdrawal email:', err));
            }

            return res.json({ success: true, message: 'Withdrawal request submitted' });
        } else {
            // Mock success
            return res.json({ success: true, message: 'Withdrawal request submitted (Mock)' });
        }

    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
