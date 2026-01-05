const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// Combine allowed origins from environment variables and defaults
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKOFFICE_URL,
  process.env.LOCAL_DEV_URL,
  ...DEFAULT_ALLOWED_ORIGINS
].filter(Boolean);

// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);

// Apply CORS with specific configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Simple in-memory rate limiter (no external dependencies)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // max requests per window

const cleanupRateLimits = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
};

// Cleanup expired entries every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

const createRateLimiter = (maxRequests = RATE_LIMIT_MAX_REQUESTS, windowMs = RATE_LIMIT_WINDOW_MS) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || (now - record.windowStart > windowMs)) {
      record = { count: 1, windowStart: now };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000)
      });
    }

    next();
  };
};

// Rate limiter for auth endpoints (stricter: 20 requests per 15 min)
const authRateLimiter = createRateLimiter(20, RATE_LIMIT_WINDOW_MS);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-api'
  });
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/forgot-password', authRateLimiter);

// API routes will be mounted here
app.use('/api/auth', require('../handlers/auth'));
app.use('/api/users', require('../handlers/users'));
app.use('/api/content', require('../handlers/content'));
app.use('/api/drops', require('../handlers/drops'));
app.use('/api/placeholder', require('../handlers/placeholder'));
app.use('/api/portfolio', require('../handlers/portfolio'));
app.use('/api/shares', require('../handlers/shares'));
app.use('/api/social-forecasts', require('../handlers/social-forecasts'));
app.use('/api/growth', require('../handlers/growth'));
app.use('/api/advertisers', require('../handlers/advertisers'));
app.use('/api/campaigns', require('../handlers/campaigns'));
app.use('/api/leaderboard', require('../handlers/leaderboard'));
app.use('/api/notifications', require('../handlers/notifications'));
app.use('/api/referrals', require('../handlers/referrals'));
app.use('/api/operator', require('../handlers/operator'));

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
