/**
 * Our Moments Backend Server
 * 
 * Express server that works alongside Supabase for enhanced functionality:
 * - Push notifications
 * - User preferences
 * - Coupons & QR check-ins
 * - ManyChat integration
 */

require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware - CORS for both www and non-www domains
const allowedOrigins = [
    'https://www.promorang.co',
    'https://promorang.co',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'our-moments-backend',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/notifications', require('./api/notifications'));
app.use('/api/preferences', require('./api/preferences'));
app.use('/api/manychat', require('./api/manychat'));

// Participation endpoints
app.get('/api/participation/me', async (req, res) => {
    try {
        const { supabase } = require('./lib/supabase');
        // Get user from auth header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Return participation data
        res.json({
            user_id: user.id,
            total_moments: 0,
            verified_proofs: 0,
            rewards_earned: 0,
            check_ins: 0
        });
    } catch (error) {
        console.error('[Participation Error]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Impact endpoints
app.get('/api/impact/me', async (req, res) => {
    try {
        const { supabase } = require('./lib/supabase');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json({
            user_id: user.id,
            total_impact: 0,
            viral_reach: 0,
            conversions: 0,
            catalyst_tier: 'bronze'
        });
    } catch (error) {
        console.error('[Impact Error]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Roles check endpoint
app.get('/api/roles/check/:role', async (req, res) => {
    try {
        const { supabase } = require('./lib/supabase');
        const { role } = req.params;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user has the requested role
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', role)
            .single();

        res.json({
            has_role: !!roles,
            role: role,
            user_id: user.id
        });
    } catch (error) {
        console.error('[Roles Error]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Host applications endpoint
app.get('/api/host-applications/me', async (req, res) => {
    try {
        const { supabase } = require('./lib/supabase');
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check for host application
        const { data: application, error: appError } = await supabase
            .from('host_applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (appError && appError.code !== 'PGRST116') {
            throw appError;
        }

        res.json({
            user_id: user.id,
            application: application || null,
            has_applied: !!application,
            status: application?.status || null
        });
    } catch (error) {
        console.error('[Host Applications Error]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// For Vercel serverless deployment
module.exports = app;
