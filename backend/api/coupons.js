/**
 * PROMORANG COUPON API
 * RESTful endpoints for coupon management
 */

const express = require('express');
const router = express.Router();
const couponService = require('../services/couponService');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Helper functions
const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/coupons/public
 * List public coupons
 */
router.get('/public', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category } = req.query;

    const result = await couponService.listPublicCoupons({
      limit,
      offset,
      category
    });

    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Coupon API] Error listing public coupons:', error);
    return sendError(res, 500, 'Failed to list coupons', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/public/:id
 * Get public coupon details
 */
router.get('/public/:id', async (req, res) => {
  try {
    const coupon = await couponService.getPublicCoupon(req.params.id);
    if (!coupon) {
      return sendError(res, 404, 'Coupon not found', 'NOT_FOUND');
    }
    return sendSuccess(res, { coupon });
  } catch (error) {
    console.error('[Coupon API] Error getting public coupon:', error);
    return sendError(res, 500, 'Failed to get coupon', 'SERVER_ERROR');
  }
});

// ============================================
// PROTECTED ROUTES
// ============================================

// Apply auth middleware to all subsequent routes
router.use(requireAuth);

/**
 * POST /api/coupons/validate
 * Validate a coupon code
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, cart_total } = req.body;

    if (!code) {
      return sendError(res, 400, 'Coupon code is required', 'MISSING_CODE');
    }

    const result = await couponService.validateCoupon(
      code,
      req.user.id,
      cart_total
    );

    if (!result.valid) {
      return sendError(res, 400, result.error, 'INVALID_COUPON');
    }

    // Calculate discount preview
    const discount = couponService.calculateDiscount(result.coupon, cart_total || {});

    return sendSuccess(res, {
      valid: true,
      coupon: result.coupon,
      discount,
    });
  } catch (error) {
    console.error('[Coupon API] Error validating coupon:', error);
    return sendError(res, 500, 'Failed to validate coupon', 'SERVER_ERROR');
  }
});

/**
 * POST /api/coupons
 * Create a new coupon (merchant only)
 */
router.post('/', async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.user.id, req.body);
    return sendSuccess(res, { coupon }, 'Coupon created successfully');
  } catch (error) {
    console.error('[Coupon API] Error creating coupon:', error);
    return sendError(res, 500, error.message || 'Failed to create coupon', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/store/:storeId
 * Get coupons for a store
 */
router.get('/store/:storeId', async (req, res) => {
  try {
    const coupons = await couponService.getStoreCoupons(
      req.params.storeId,
      req.query
    );
    return sendSuccess(res, { coupons });
  } catch (error) {
    console.error('[Coupon API] Error getting store coupons:', error);
    return sendError(res, 500, 'Failed to get coupons', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/:couponId
 * Get coupon details
 */
router.get('/:couponId', async (req, res) => {
  try {
    const result = await couponService.getCouponAnalytics(req.params.couponId);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Coupon API] Error getting coupon:', error);
    return sendError(res, 500, error.message || 'Failed to get coupon', 'SERVER_ERROR');
  }
});

/**
 * PATCH /api/coupons/:couponId
 * Update a coupon
 */
router.patch('/:couponId', async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.couponId,
      req.user.id,
      req.body
    );
    return sendSuccess(res, { coupon }, 'Coupon updated successfully');
  } catch (error) {
    console.error('[Coupon API] Error updating coupon:', error);
    return sendError(res, 500, error.message || 'Failed to update coupon', 'SERVER_ERROR');
  }
});

/**
 * DELETE /api/coupons/:couponId
 * Delete/deactivate a coupon
 */
router.delete('/:couponId', async (req, res) => {
  try {
    await couponService.deleteCoupon(req.params.couponId, req.user.id);
    return sendSuccess(res, {}, 'Coupon deleted successfully');
  } catch (error) {
    console.error('[Coupon API] Error deleting coupon:', error);
    return sendError(res, 500, error.message || 'Failed to delete coupon', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/:couponId/analytics
 * Get coupon usage analytics
 */
router.get('/:couponId/analytics', async (req, res) => {
  try {
    const analytics = await couponService.getCouponAnalytics(req.params.couponId);
    return sendSuccess(res, analytics);
  } catch (error) {
    console.error('[Coupon API] Error getting coupon analytics:', error);
    return sendError(res, 500, 'Failed to get analytics', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/campaign/:campaignId
 * Get coupons for a campaign
 */
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const coupons = await couponService.getCampaignCoupons(req.params.campaignId);
    return sendSuccess(res, { coupons });
  } catch (error) {
    console.error('[Coupon API] Error getting campaign coupons:', error);
    return sendError(res, 500, 'Failed to get campaign coupons', 'SERVER_ERROR');
  }
});

/**
 * POST /api/coupons/campaign/:campaignId
 * Create coupon for a campaign
 */
router.post('/campaign/:campaignId', async (req, res) => {
  try {
    const coupon = await couponService.createCampaignCoupon(
      req.user.id,
      req.params.campaignId,
      req.body
    );
    return sendSuccess(res, { coupon }, 'Campaign coupon created successfully');
  } catch (error) {
    console.error('[Coupon API] Error creating campaign coupon:', error);
    return sendError(res, 500, error.message || 'Failed to create campaign coupon', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/drop/:dropId
 * Get coupons for a drop
 */
router.get('/drop/:dropId', async (req, res) => {
  try {
    const coupons = await couponService.getDropCoupons(req.params.dropId);
    return sendSuccess(res, { coupons });
  } catch (error) {
    console.error('[Coupon API] Error getting drop coupons:', error);
    return sendError(res, 500, 'Failed to get drop coupons', 'SERVER_ERROR');
  }
});

/**
 * POST /api/coupons/drop/:dropId
 * Create coupon for a drop
 */
router.post('/drop/:dropId', async (req, res) => {
  try {
    const coupon = await couponService.createDropCoupon(
      req.user.id,
      req.params.dropId,
      req.body
    );
    return sendSuccess(res, { coupon }, 'Drop coupon created successfully');
  } catch (error) {
    console.error('[Coupon API] Error creating drop coupon:', error);
    return sendError(res, 500, error.message || 'Failed to create drop coupon', 'SERVER_ERROR');
  }
});

/**
 * GET /api/coupons/analytics/unified
 * Get unified analytics across all coupon types
 */
router.get('/analytics/unified', async (req, res) => {
  try {
    const analytics = await couponService.getUnifiedCouponAnalytics(req.query);
    return sendSuccess(res, { analytics });
  } catch (error) {
    console.error('[Coupon API] Error getting unified analytics:', error);
    return sendError(res, 500, 'Failed to get unified analytics', 'SERVER_ERROR');
  }
});

module.exports = router;
