const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper function to generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            user_type: user.user_type,
            points_balance: user.points_balance || 0,
            keys_balance: user.keys_balance || 0,
            gems_balance: user.gems_balance || 0,
            gold_collected: user.gold_collected || 0,
            user_tier: user.user_tier || 'free',
            avatar_url: user.avatar_url
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Helper function to verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // For development, we might want to allow mock users if no token is provided
        if (process.env.NODE_ENV === 'development') {
            req.user = { id: 'mock-user-id', email: 'demo@example.com', username: 'demo_user' };
            return next();
        }

        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        // Fallback for development even on invalid tokens
        if (process.env.NODE_ENV === 'development') {
            req.user = { id: 'mock-user-id', email: 'demo@example.com', username: 'demo_user' };
            return next();
        }

        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    req.user = decoded;
    next();
};

module.exports = {
    authMiddleware,
    generateToken,
    verifyToken,
    decodeToken: verifyToken, // Alias for backward compatibility
    JWT_SECRET
};
