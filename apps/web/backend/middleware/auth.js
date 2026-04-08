/**
 * Auth Middleware for Our Moments
 * Validates Supabase JWT tokens
 */

const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

/**
 * Require authentication - rejects unauthenticated requests
 */
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required',
            code: 'MISSING_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId || decoded.id || decoded.sub;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token payload',
                code: 'INVALID_TOKEN'
            });
        }

        // Attach user info to request
        req.user = {
            id: userId,
            email: decoded.email,
            role: decoded.role || 'participant',
            token_payload: decoded
        };

        // If we have Supabase, enrich with profile data
        if (supabase) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', userId)
                .single();

            if (profile) {
                req.user.full_name = profile.full_name;
                req.user.avatar_url = profile.avatar_url;
            }
        }

        next();
    } catch (error) {
        console.error('[Auth] Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
}

/**
 * Optional auth - attaches user if token present, continues if not
 */
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId || decoded.id || decoded.sub;

        if (userId) {
            req.user = {
                id: userId,
                email: decoded.email,
                role: decoded.role || 'participant',
                token_payload: decoded
            };
        }
    } catch (error) {
        // Token invalid but optional, continue without user
    }

    next();
}

module.exports = { requireAuth, optionalAuth };
