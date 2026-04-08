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

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Our Moments Backend running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
