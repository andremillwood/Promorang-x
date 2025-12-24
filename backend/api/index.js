const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { requireAuth } = require('../middleware/auth');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

// Parse JSON bodies
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store the raw body for potential verification
    req.rawBody = buf.toString();
  }
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000000
}));

// Log request body for debugging
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
});

// Default allowed origins (for development)
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://promorang.co',
  'https://www.promorang.co',
  'https://promorang-alt-andremillwood.vercel.app',
  'https://promorang-9idmgnr67-andre-millwoods-projects.vercel.app'
];

// Log allowed origins for debugging
console.log('Allowed CORS origins:', DEFAULT_ALLOWED_ORIGINS);

// Apply permissive CORS that reflects the request origin (needed for credentials)
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = DEFAULT_ALLOWED_ORIGINS.includes(origin) || (() => {
      try {
        const { hostname } = new URL(origin);
        return hostname === 'promorang.co' || hostname === 'www.promorang.co' || hostname.endsWith('.promorang.co');
      } catch (error) {
        return false;
      }
    })();

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`CORS warning: unrecognized origin ${origin}. Allowing temporarily.`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin']
});

app.use(corsMiddleware);
app.options('*', corsMiddleware, (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Origin');
  res.sendStatus(204);
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.headers.origin || 'unknown origin'}`);
  next();
});

// Log request body for debugging
app.use((req, res, next) => {
  console.log('Request body:', req.body);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-api'
  });
});

// API routes will be mounted here
app.use('/api/auth', require('./auth'));
app.use('/api/users', require('./users'));
app.use('/api/content', require('./content'));
app.use('/api/drops', require('./drops'));
app.use('/api/placeholder', require('./placeholder'));
app.use('/api/portfolio', require('./portfolio'));
app.use('/api/shares', require('./shares'));
app.use('/api/social-forecasts', require('./social-forecasts'));
app.use('/api/growth', require('./growth'));
app.use('/api/operator', require('./operator'));
app.use('/api/advertisers', require('./advertisers'));
app.use('/api/campaigns', require('./campaigns'));
app.use('/api/leaderboard', require('./leaderboard'));
app.use('/api/rewards', require('./rewards'));
app.use('/api/manychat', require('./manychat'));
app.use('/api/marketplace', require('./marketplace'));
app.use('/api/coupons', require('./coupons'));

app.get('/api/referrals/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      summary: {
        total_referrals: 0,
        active_referrals: 0,
        pending_referrals: 0,
        conversion_rate: '0.0',
        total_earnings: {
          usd: 0,
          gems: 0,
          points: 0,
        },
        referral_code: null,
        tier: {
          tier_name: 'Bronze',
          tier_level: 1,
          commission_rate: 0.05,
          badge_icon: '🥉',
          badge_color: '#CD7F32',
        },
      },
      referrals: [],
      recent_commissions: [],
    },
  });
});

app.get('/api/referrals/tiers', (req, res) => {
  res.json({
    status: 'success',
    data: {
      tiers: [
        {
          tier_name: 'Bronze',
          tier_level: 1,
          min_referrals: 0,
          commission_rate: 0.05,
          badge_icon: '🥉',
          badge_color: '#CD7F32',
          perks: [],
        },
        {
          tier_name: 'Silver',
          tier_level: 2,
          min_referrals: 10,
          commission_rate: 0.06,
          badge_icon: '🥈',
          badge_color: '#C0C0C0',
          perks: [],
        },
        {
          tier_name: 'Gold',
          tier_level: 3,
          min_referrals: 50,
          commission_rate: 0.075,
          badge_icon: '🥇',
          badge_color: '#FFD700',
          perks: [],
        },
      ],
    },
  });
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
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = app;

// For Vercel serverless deployment
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Promorang API server running on port ${PORT}`);
  });
}
