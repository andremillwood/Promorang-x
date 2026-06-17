/**
 * FEATURED MARKETPLACE API
 * 
 * Endpoints for managing featured content and moment placements:
 * - Browse available placement types
 * - Calculate pricing
 * - Create bookings
 * - Track analytics (impressions, clicks)
 * - Manage active placements
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const featuredMarketplaceService = require('../services/featuredMarketplaceService');

/**
 * GET /api/featured-marketplace/placement-types
 * Get all available placement types with pricing
 */
router.get('/placement-types', async (req, res) => {
    try {
        const types = featuredMarketplaceService.getPlacementTypes();
        
        res.json({
            success: true,
            placement_types: types
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting placement types:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/pricing/:placementType
 * Get pricing for a specific placement type
 */
router.get('/pricing/:placementType', async (req, res) => {
    try {
        const { placementType } = req.params;
        const { duration_days = 1, budget } = req.query;
        
        const pricing = featuredMarketplaceService.getPlacementPricing(placementType, {
            duration_days: parseInt(duration_days),
            budget: budget ? parseFloat(budget) : null
        });
        
        res.json({
            success: true,
            pricing
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting pricing:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/availability/:placementType
 * Check availability for a placement type
 */
router.get('/availability/:placementType', async (req, res) => {
    try {
        const { placementType } = req.params;
        const { start_date = new Date(), duration_days = 1 } = req.query;
        
        const availability = await featuredMarketplaceService.checkAvailability(
            placementType,
            new Date(start_date),
            parseInt(duration_days)
        );
        
        res.json({
            success: true,
            availability
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error checking availability:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/featured-marketplace/book
 * Create a featured placement booking
 */
router.post('/book', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            placement_type, 
            entity_id, 
            entity_type,
            duration_days = 1,
            start_date = new Date(),
            budget
        } = req.body;
        
        if (!placement_type || !entity_id || !entity_type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: placement_type, entity_id, entity_type'
            });
        }
        
        const result = await featuredMarketplaceService.createBooking(
            userId,
            placement_type,
            entity_id,
            entity_type,
            {
                duration_days: parseInt(duration_days),
                start_date: new Date(start_date),
                budget: budget ? parseFloat(budget) : null
            }
        );
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('[Featured Marketplace API] Error creating booking:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/active
 * Get currently active featured placements
 */
router.get('/active', async (req, res) => {
    try {
        const { placement_type, limit = 10 } = req.query;
        
        const placements = await featuredMarketplaceService.getActivePlacements(
            placement_type,
            parseInt(limit)
        );
        
        res.json({
            success: true,
            placements,
            count: placements.length
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting active placements:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/my-bookings
 * Get current user's booking history
 */
router.get('/my-bookings', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        
        const bookings = await featuredMarketplaceService.getUserBookings(userId, status);
        
        res.json({
            success: true,
            bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting user bookings:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/featured-marketplace/:placementId/record-impression
 * Record an impression for analytics
 */
router.post('/:placementId/record-impression', async (req, res) => {
    try {
        const { placementId } = req.params;
        
        await featuredMarketplaceService.recordImpression(placementId);
        
        res.json({
            success: true,
            message: 'Impression recorded'
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error recording impression:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/featured-marketplace/:placementId/record-click
 * Record a click for CPC placements
 */
router.post('/:placementId/record-click', requireAuth, async (req, res) => {
    try {
        const { placementId } = req.params;
        const userId = req.user.id;
        
        await featuredMarketplaceService.recordClick(placementId, userId);
        
        res.json({
            success: true,
            message: 'Click recorded'
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error recording click:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/revenue-stats
 * Admin endpoint to get revenue statistics
 */
router.get('/revenue-stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const stats = await featuredMarketplaceService.getRevenueStats(
            start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date || new Date().toISOString()
        );
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting revenue stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/featured-marketplace/:bookingId/activate
 * Admin endpoint to activate a booking after payment
 */
router.post('/:bookingId/activate', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const result = await featuredMarketplaceService.activateBooking(bookingId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('[Featured Marketplace API] Error activating booking:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/featured-marketplace/:bookingId/checkout
 * Create Stripe checkout session for booking payment
 */
router.post('/:bookingId/checkout', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;
        
        const result = await featuredMarketplaceService.createCheckoutSession(userId, bookingId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('[Featured Marketplace API] Error creating checkout:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/featured-marketplace/:bookingId/payment-status
 * Check payment status for a booking
 */
router.get('/:bookingId/payment-status', requireAuth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const result = await featuredMarketplaceService.getPaymentStatus(bookingId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('[Featured Marketplace API] Error getting payment status:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
