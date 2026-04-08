const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { requireAuth } = require('../middleware/auth');

const app = express();

// SECURITY & CORS MUST BE FIRST
app.use(helmet());

// Default allowed origins
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://promorang.co',
  'https://www.promorang.co',
  'https://promorang-alt.vercel.app',
  'https://promorang-alt-andremillwood.vercel.app'
];

// Robust CORS Middleware
const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isAllowed = DEFAULT_ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.promorang.co') ||
      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS warning: origin ${origin} not explicitly in whitelist`);
      callback(null, true); // Allow for now but log
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Api-Version', 'X-Advertiser-Account-Id', 'X-Merchant-Account-Id']
});

app.use(corsMiddleware);

// Handle preflight explicitly
app.options('*', corsMiddleware);

// Logging middleware
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

// CORS already handled above

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

// OAuth Redirect Bridge: Bounces misplaced Google Login redirects from API to Frontend
// This handles both explicit /auth/callback and root / (which Supabase uses as a fallback)
const handleAuthRedirect = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://promorang.co';
  const primaryUrl = frontendUrl.split(',')[0].trim();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  try {
    // If we have a code or error FROM Google, we need to bridge it to Supabase
    // This allows api.promorang.co to be the official 'redirect_uri' for branding
    if (req.query.code || req.query.error) {
      if (supabaseUrl) {
        const supabaseCallbackUrl = new URL('/auth/v1/callback', supabaseUrl);
        Object.keys(req.query).forEach(key => {
          supabaseCallbackUrl.searchParams.append(key, req.query[key]);
        });
        console.log(`🔀 Bridging OAuth code to Supabase: ${supabaseCallbackUrl.toString().split('?')[0]}...`);
        return res.redirect(supabaseCallbackUrl.toString());
      }
    }

    // Standard redirect to frontend
    const path = req.path === '/' ? '' : req.path;
    const targetUrl = new URL(path, primaryUrl);

    // Forward all query parameters (code, error, etc.)
    Object.keys(req.query).forEach(key => {
      targetUrl.searchParams.append(key, req.query[key]);
    });

    console.log(`🔀 Bridging auth request from ${req.path} to: ${targetUrl.toString()}`);
    res.redirect(targetUrl.toString());
  } catch (error) {
    console.error('❌ Failed to construct redirect URL:', error);
    res.redirect(primaryUrl); // Last ditch effort
  }
};

app.get('/auth/callback', handleAuthRedirect);
app.get('/', handleAuthRedirect);

const { supabase } = require('../lib/supabase');

// ... (existing code)

// Debug endpoint to show environment status
app.get('/api/debug', async (req, res) => {
  const sUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  // System Test: Try to fetch a record using Service Role Key
  let systemTest = 'Pending';
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      systemTest = `Error: ${error.message} (Code: ${error.code})`;
    } else {
      systemTest = `Success: Found ${data.length} records`;
    }
  } catch (err) {
    systemTest = `Exception: ${err.message}`;
  }

  res.json({
    deploy_version: 'v7-recovery-2026-04-08',
    node_version: process.version,
    vercel: !!process.env.VERCEL,
    supabase_url_masked: sUrl ? `${sUrl.substring(0, 15)}...${sUrl.substring(sUrl.length - 8)}` : 'Missing',
    supabase_key: !!process.env.SUPABASE_SERVICE_KEY || !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwt_secret: !!process.env.JWT_SECRET || !!process.env.SUPABASE_JWT_SECRET,
    supabase_system_test: systemTest
  });
});

// Auth diagnostic endpoint - tests what happens when a token goes through auth
const jwt = require('jsonwebtoken');
app.get('/api/auth-test', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  const report = {
    deploy_version: 'v7-recovery-2026-04-08',
    has_auth_header: !!req.headers.authorization,
    auth_header_prefix: authHeader.substring(0, 15) + '...',
    token_present: !!token,
    token_length: token ? token.length : 0,
    token_first_20: token ? token.substring(0, 20) + '...' : null,
  };
  
  if (token) {
    // Step 1: Can we decode it?
    try {
      const decoded = jwt.decode(token);
      report.decode_success = !!decoded;
      report.decode_type = typeof decoded;
      if (decoded && typeof decoded === 'object') {
        report.token_sub = decoded.sub || null;
        report.token_iss = decoded.iss || null;
        report.token_role = decoded.role || null;
        report.token_exp = decoded.exp || null;
        report.token_expired = decoded.exp ? decoded.exp < (Date.now() / 1000) : 'no_exp';
        report.has_user_metadata = !!decoded.user_metadata;
      }
    } catch (e) {
      report.decode_error = e.message;
    }
    
    // Step 2: Can Supabase verify it?
    try {
      const { data, error } = await supabase.auth.getUser(token);
      report.supabase_getUser_success = !error && !!data?.user;
      report.supabase_getUser_error = error?.message || null;
      report.supabase_getUser_status = error?.status || null;
      if (data?.user) {
        report.supabase_user_id = data.user.id;
        report.supabase_user_email = data.user.email;
      }
    } catch (e) {
      report.supabase_getUser_exception = e.message;
    }
    
    // Step 3: Can we verify with JWT_SECRET?
    const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
    report.jwt_secret_available = !!jwtSecret;
    if (jwtSecret) {
      try {
        const verified = jwt.verify(token, jwtSecret);
        report.jwt_verify_success = true;
        report.jwt_verify_sub = verified.sub;
      } catch (e) {
        report.jwt_verify_error = e.message;
      }
    }
  }
  
  res.json(report);
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/forgot-password', authRateLimiter);

// API routes will be mounted here
app.use('/api/auth', require('./auth'));
app.use('/api/ami', require('./ami'));
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
app.use('/api/advertisers', requireAuth, require('./advertiserTeam')); // Team management routes
app.use('/api/campaigns', require('./campaigns'));
// app.use('/api/leaderboard', require('./leaderboard'));
app.use('/api/rewards', require('./rewards'));
// app.use('/api/withdrawal', require('./withdrawal')); // DISABLED
app.use('/api/payments', (req, res) => res.status(403).json({ error: 'Service Disabled', message: 'Gem purchasing is currently disabled during platform realignment.' }));
app.use('/api/manychat', require('./manychat'));
// app.use('/api/marketplace', require('./market')); // MOVED BELOW
app.use('/api/merchant-team', requireAuth, require('./merchantTeam'));
app.use('/api/coupons', require('./coupons'));
app.use('/api/events', require('./events'));
app.use('/api/notifications', (req, res) => res.json({ success: true, data: [] })); // Placeholder for missing notifications
const errorHandlers = require('./errors');
app.post('/api/report-error', errorHandlers.handleReportError);
app.post('/api/log-error', errorHandlers.handleLogError);
app.get('/api/error-logs', errorHandlers.handleGetLogs);
app.patch('/api/error-logs/:id', errorHandlers.handleResolveLog);
app.use('/api/telemetry', require('./telemetry'));
app.use('/api/referrals', require('./referrals'));
app.use('/api/feed', require('./feed'));
app.use('/api/promoshare', require('./promoshare'));
app.use('/api/relays', require('./relays'));
// app.use('/api/streaks', require('./streaks'));
app.use('/api/quests', require('./quests'));
app.use('/api/activity', require('./activity'));
// app.use('/api/achievements', require('./achievements'));
app.use('/api/bonuses', require('./bonuses'));
app.use('/api/sounds', require('./sounds'));
app.use('/api/blog', require('./blog'));
app.use('/api/search', require('./search'));
app.use('/api/market', require('./market'));
app.use('/api/marketplace', require('./marketplace')); // New Product Commerce
app.use('/api/payouts', requireAuth, require('./payouts')); // Host Payouts
app.use('/api/bounty', requireAuth, require('./bounty'));
app.use('/api/matrix', requireAuth, require('./matrix'));
app.use('/api/maturity', require('./maturity'));
app.use('/api/merchant-sampling', require('./merchantSampling'));
app.use('/api/today', require('./today')); // Daily Layer Today Screen
app.use('/api/moments', require('./moments')); // Moment Infrastructure
app.use('/api/roles', require('./roles')); // Role Management
app.use('/api/roles', require('./roles')); // Role Management
app.use('/api/host-applications', require('./host-applications')); // Host Applications
app.use('/api/organizations', require('./organizations')); // B2B Onboarding & Management
app.use('/api/brand', require('./brand')); // Brand Campaign Management
app.use('/api/stripe', require('./stripe')); // Stripe Payment & Connect
app.use('/api/merchant', require('./merchant')); // Merchant Product & Sales Management
app.use('/api/moment-products', require('./momentProducts')); // Moment-Product Integration
app.use('/api/analytics', require('./analytics')); // Advanced Analytics & Reporting
app.use('/api/demo', require('./demo-login')); // Demo state shortcuts

// Start Daily Layer Cron Jobs if enabled (Local/Dev only)
if (process.env.ENABLE_CRON_JOBS === 'true') {
  try {
    const cronPath = require('path').join(__dirname, '../jobs/dailyLayerJob');
    require(cronPath);
    console.log('📅 Daily Layer cron jobs started (reset: 10:00 UTC)');
  } catch (error) {
    console.warn('⚠️ Failed to start Daily Layer jobs:', error.message);
  }
}

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
