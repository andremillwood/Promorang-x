const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const app = express();

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize WebSocket service if socket.io is available
let io = null;
if (process.env.ENABLE_WEBSOCKETS !== 'false') {
    try {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'http://127.0.0.1:5173',
                    'http://localhost:5000',
                    'https://promorang.co',
                    'https://www.promorang.co',
                    process.env.FRONTEND_URL
                ].filter(Boolean),
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // WebSocket connection handler
        io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            // Join cycle-specific rooms for draw updates
            socket.on('subscribe:cycle', (cycleId) => {
                socket.join(`cycle:${cycleId}`);
                console.log(`📡 ${socket.id} subscribed to cycle ${cycleId}`);
            });

            // Join global promoshare room
            socket.on('subscribe:promoshare', () => {
                socket.join('promoshare');
                console.log(`📡 ${socket.id} subscribed to promoshare updates`);
            });

            // Leave cycle room
            socket.on('unsubscribe:cycle', (cycleId) => {
                socket.leave(`cycle:${cycleId}`);
            });

            socket.on('disconnect', () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
            });
        });

        // Expose io globally for use in services
        global.io = io;
        console.log('🔌 WebSocket server initialized');
    } catch (error) {
        console.warn('⚠️ Socket.io not available:', error.message);
    }
}
const payments = require('./api/payments');
// const shares = require('./api/shares');
const { supabase: supabaseClient } = require('./lib/supabase');

app.post('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }), payments.stripeWebhook);
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), payments.stripeWebhook);

// Security middleware
app.use(helmet());

// CORS middleware with preflight handling
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://promorang.co',
    'https://www.promorang.co',
    'https://promorang-alt.vercel.app',
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [])
  ].filter(Boolean);

  const origin = req.headers.origin;

  // In development mode, allow any origin (for Replit proxy support)
  // In production, only allow whitelisted origins
  if (process.env.NODE_ENV === 'development') {
    // When there's an origin header, echo it back
    // When there's no origin (same-origin requests), use '*'
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }

  next();
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

// Parse JSON bodies with error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      req.rawBody = buf.toString();
    } catch (e) {
      console.error('Error parsing JSON body:', e);
    }
  }
}));

// Parse URL-encoded bodies with error handling
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000000
}));

// Log request body for debugging
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  next();
});

// Expose Supabase client globally for legacy modules
global.supabase = supabaseClient || null;

// API routes
app.use('/api/auth', require('./api/auth'));
app.use('/auth', require('./api/auth')); // Direct route for frontend compatibility
app.use('/api/users', require('./api/users'));
app.use('/users', require('./api/users')); // Direct route
app.use('/api/users/preferences', require('./api/preferences')); // User preferences for personalization
app.use('/api/content', require('./api/content'));
app.use('/content', require('./api/content')); // Direct route
app.use('/api/o2o', require('./api/o2o'));
app.use('/api/drops', require('./api/drops'));
app.use('/drops', require('./api/drops')); // Direct route
// app.use('/api/social-forecasts', require('./api/social-forecasts'));
app.use('/api/advertisers', require('./api/advertisers'));
app.use('/api/maturity', require('./api/maturity'));

app.use('/api/relays', require('./api/relays'));
app.use('/api/growth', require('./api/growth'));
// app.use('/api/portfolio', require('./api/portfolio'));
app.use('/api/platform-drops', require('./api/platform-drops'));
// app.use('/api/shares', shares);
app.use('/api/placeholder', require('./api/placeholder'));
app.use('/api/payments', payments.router);
app.use('/api/telemetry', require('./api/telemetry'));
app.use('/api/feed', require('./api/feed'));
app.use('/api/events', require('./api/events'));

app.use('/api/rewards', require('./api/rewards'));
app.use('/api/coupons', require('./api/coupons'));
app.use('/api/notifications', require('./api/notifications'));
app.use('/api/referrals', require('./api/referrals'));
app.use('/api/activations', require('./api/activations'));
app.use('/api/integrations', require('./api/integrations'));
app.use('/api/ami', require('./api/ami'));
app.use('/api/search', require('./api/search'));
app.use('/api/matchmaking', require('./api/matchmaking'));
app.use('/api/operator', require('./api/operator'));
app.use('/api/campaigns', require('./api/campaigns'));
app.use('/api/manychat', require('./api/manychat'));

app.use('/api/kyc', require('./api/kyc'));
app.use('/api/admin', require('./api/admin'));
app.use('/api/support', require('./api/support'));
app.use('/api/moments', require('./api/moments'));
app.use('/api/moments', require('./api/moment-pricing')); // Moment SKU pricing endpoints
app.use('/api/participation', require('./api/participation'));
app.use('/api/pulse', require('./api/pulse'));
app.use('/api/proof', require('./api/proof'));
app.use('/api/memories', require('./api/memories'));
app.use('/api/impact', require('./api/impact'));
app.use('/api/creator-economics', require('./api/creator-economics'));
app.use('/api/analytics', require('./api/analytics'));
app.use('/api/today', require('./api/today')); // Daily Layer Today Screen
app.use('/api/cron', require('./api/cron')); // Serverless cron entrypoints
app.use('/api/email', require('./api/email')); // Email event entrypoints
const errorHandlers = require('./api/errors');
app.post('/api/report-error', errorHandlers.handleReportError);
app.post('/api/log-error', errorHandlers.handleLogError);
app.get('/api/error-logs', errorHandlers.handleGetLogs);
app.patch('/api/error-logs/:id', errorHandlers.handleResolveLog);
// app.get('/s/:id', shares.redirectHandler);

// Demo login endpoint (bypasses default body parser)
app.use('/api/demo', require('./api/demo-login'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-api-prod'
  });
});

// Simple demo login endpoint
app.post('/api/demo-login', (req, res) => {
  try {
    console.log('Demo login request received');

    // Create a demo user response
    const demoUser = {
      id: 'demo-creator-id',
      email: 'creator@demo.com',
      username: 'demo_creator',
      display_name: 'Demo Creator',
      user_type: 'creator',
      points_balance: 1000,
      keys_balance: 50,
      gems_balance: 100,
      gold_collected: 0,
      user_tier: 'free'
    };

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      {
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.username,
        user_type: demoUser.user_type
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user: demoUser,
      token
    });
  } catch (error) {
    console.error('Error in demo login:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process demo login'
    });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API endpoint does not exist'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: error.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;
const HOST = 'localhost'; // Always bind to localhost for backend
function startLocalServer() {
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Promorang API development server running on ${HOST}:${PORT}`);
    console.log(`📡 Frontend URL: http://localhost:5000`);
    console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);

    // Start cron jobs if enabled
    if (process.env.ENABLE_CRON_JOBS === 'true') {
      try {
        const cronJobs = require('./jobs/cron');
        cronJobs.startCronJobs();
        console.log('⏰ Cron jobs started');
      } catch (error) {
        console.warn('⚠️ Failed to start cron jobs:', error.message);
      }

      // Start email campaign scheduler
      try {
        const emailScheduler = require('./jobs/emailScheduler');
        emailScheduler.start();
        console.log('📧 Email campaign scheduler started');
      } catch (error) {
        console.warn('⚠️ Failed to start email scheduler:', error.message);
      }

      // Start Daily Layer cron jobs (10:00 UTC reset)
      try {
        const dailyLayerJob = require('./jobs/dailyLayerJob');
        dailyLayerJob.start();
        console.log('📅 Daily Layer cron jobs started (reset: 10:00 UTC)');
      } catch (error) {
        console.warn('⚠️ Failed to start Daily Layer jobs:', error.message);
      }

      // Start PromoShare scheduler (cycle management and draws)
      try {
        const promoShareScheduler = require('./jobs/promoShareScheduler');
        promoShareScheduler.start();
        console.log('🎰 PromoShare scheduler started');
      } catch (error) {
        console.warn('⚠️ Failed to start PromoShare scheduler:', error.message);
      }
    } else {
      console.log('⏰ Cron jobs disabled (set ENABLE_CRON_JOBS=true to enable)');
    }
  });
}

if (!process.env.VERCEL && require.main === module) {
  startLocalServer();
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
