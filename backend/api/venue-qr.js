/**
 * PROMORANG VENUE QR API
 * Endpoints for managing and tracking IRL onboarding QR codes
 */

const express = require('express');
const router = express.Router();
const venueQrService = require('../services/venueQrService');
const { requireAuth } = require('../middleware/auth');

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
 * GET /api/venue-qr/scan/:code
 * Public redirect for QR scans. Tracks scan and redirects to landing page.
 */
router.get('/scan/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // In a real system we'd fetch the record to get the referral code or specific landing URL
        // For now we'll just track and redirect to the app with the ref param

        // Track scan asynchronously
        const metadata = {
            ip_hash: req.ip,
            user_agent: req.headers['user-agent'],
            device_type: /mobile/i.test(req.headers['user-agent']) ? 'mobile' : 'desktop'
        };

        // We don't await this to keep the redirect fast
        venueQrService.trackSubScan(id, metadata).catch(err => console.error('Scan tracking err:', err));

        // For now redirecting to signup with ref param
        // We would need to look up the referral code for this VQR ID
        // Construct basic fallback URL
        const appUrl = process.env.APP_URL || 'https://promorang.com';
        return res.redirect(`${appUrl}/signup?vqr=${id}`);

    } catch (error) {
        console.error('[Venue QR API] Error handling scan:', error);
        return res.redirect(`${process.env.APP_URL || 'https://promorang.com'}/signup`);
    }
});

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(requireAuth);

/**
 * GET /api/venue-qr
 * List user's venue QR codes
 */
router.get('/', async (req, res) => {
    try {
        const vqrs = await venueQrService.listVenueQRs(req.user.id);
        return sendSuccess(res, { venue_qr_codes: vqrs });
    } catch (error) {
        console.error('[Venue QR API] Error listing venue QRs:', error);
        return sendError(res, 500, 'Failed to list venue QR codes', 'SERVER_ERROR');
    }
});

/**
 * POST /api/venue-qr
 * Create a new venue QR code
 */
router.post('/', async (req, res) => {
    try {
        const vqr = await venueQrService.createVenueQR(req.user.id, req.body);
        return sendSuccess(res, { venue_qr_code: vqr }, 'Venue QR code created successfully');
    } catch (error) {
        console.error('[Venue QR API] Error creating venue QR:', error);
        return sendError(res, 500, 'Failed to create venue QR code', 'SERVER_ERROR');
    }
});

/**
 * GET /api/venue-qr/:id
 * Get venue QR details + analytics
 */
router.get('/:id', async (req, res) => {
    try {
        const vqr = await venueQrService.getVenueQR(req.user.id, req.params.id);
        if (!vqr) return sendError(res, 404, 'Venue QR not found', 'NOT_FOUND');
        return sendSuccess(res, { venue_qr_code: vqr });
    } catch (error) {
        console.error('[Venue QR API] Error getting venue QR:', error);
        return sendError(res, 500, 'Failed to get venue QR code', 'SERVER_ERROR');
    }
});

module.exports = router;
