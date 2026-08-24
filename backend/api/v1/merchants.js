const express = require('express');
const router = express.Router();
const { requireApiKeyOrAuth } = require('../../middleware/apiKeyAuth');
const { supabase } = require('../../lib/supabase');

/**
 * GET /api/v1/merchants/:id/live-ops
 * Fetch merchant live inventory, remaining budget, and conversion stats.
 */
router.get('/:id/live-ops', requireApiKeyOrAuth(['merchants:read']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json({
        success: true,
        data: {
          merchantId: id,
          name: 'Demo Merchant Ops',
          status: 'active',
          totalBudget: 250000,
          allocatedBudget: 75000,
          availableBudget: 175000,
          currency: 'JMD',
          activeOffersCount: 3,
          activeDropRedemptionsToday: 18
        }
      });
    }

    const [{ data: org }, { data: budget }, { data: products }] = await Promise.all([
      supabase.from('organizations').select('id, name, type, metadata, created_at').eq('id', id).maybeSingle(),
      supabase.from('brand_budgets').select('total_budget, allocated_budget, status').eq('organization_id', id).maybeSingle(),
      supabase.from('merchant_products').select('id, name, price, category').eq('merchant_id', id).limit(20)
    ]);

    const total = budget?.total_budget || 0;
    const allocated = budget?.allocated_budget || 0;

    return res.json({
      success: true,
      data: {
        organization: org || { id, name: 'Merchant Organization' },
        budget: {
          totalBudget: total,
          allocatedBudget: allocated,
          availableBudget: Math.max(0, total - allocated),
          status: budget?.status || 'inactive'
        },
        products: products || []
      }
    });
  } catch (err) {
    console.error('[API v1 /merchants/live-ops] Error:', err);
    return res.status(500).json({ success: false, error: err.message, code: 'MERCHANT_LIVE_OPS_FAILED' });
  }
});

module.exports = router;
