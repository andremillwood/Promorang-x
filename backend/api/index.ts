import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { corsMw, corsPreflightHandler } from './_core/cors';
import { requireAuth } from './_core/auth';
import { supabaseAdmin } from './_core/supabase';
import { handleError, AuthenticatedRequest } from './_core/apiUtils';
import jwt from 'jsonwebtoken';
// Use working JS routes with demo data instead of broken TS routes
const contentRoutes = require('./content.js');
const dropsRoutes = require('./drops.js');
const usersRoutes = require('./users.js');
const portfolioRoutes = require('./portfolio.js');
const socialForecastRoutes = require('./social-forecasts.js');
const advertisersRoutes = require('./advertisers.js');
const leaderboardRoutes = require('./leaderboard.js');
const rewardsRoutes = require('./rewards.js');
const operatorRoutes = require('./operator.js');

const SEARCH_CONTENT = [
  {
    id: 'content-demo-1',
    title: 'Launch Campaign: Social Buzz',
    description: 'Highlight reel from the recent product launch activation.',
    platform: 'instagram',
    creator_name: 'Demo Creator',
    share_price: 12.5,
  },
  {
    id: 'content-demo-2',
    title: 'Creator Toolkit Walkthrough',
    description: 'Step-by-step guide on monetizing content in 30 days.',
    platform: 'youtube',
    creator_name: 'Creator Collective',
    share_price: 18.0,
  },
];

const SEARCH_DROPS = [
  {
    id: 'drop-demo-1',
    title: 'Product Review Blitz',
    description: 'Create authentic reviews for the new premium bundle.',
    gem_reward_base: 120,
    key_cost: 4,
    status: 'active',
  },
  {
    id: 'drop-demo-2',
    title: 'Launch Day Engagement Sprint',
    description: 'Boost engagement metrics during launch weekend.',
    gem_reward_base: 95,
    key_cost: 3,
    status: 'active',
  },
];

const SEARCH_USERS = [
  {
    id: 'user-demo-1',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator',
    follower_count: 42000,
    avatar_url: null,
    level: 5,
    user_tier: 'silver',
  },
  {
    id: 'user-demo-2',
    username: 'growth_analyst',
    display_name: 'Growth Analyst',
    user_type: 'advertiser',
    follower_count: 12500,
    avatar_url: null,
    level: 3,
    user_tier: 'bronze',
  },
];

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading resources from other origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS middleware
app.use(corsMw);
app.options('*', corsPreflightHandler);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Demo login endpoint (protected in production by DEMO_LOGINS_ENABLED)
app.post('/api/auth/demo/:role', async (req, res) => {
  if (process.env.DEMO_LOGINS_ENABLED !== 'true') {
    return res.status(403).json({ success: false, error: 'Demo logins are disabled' });
  }

  const { role } = req.params;
  if (!['creator', 'advertiser', 'investor', 'operator', 'merchant'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  try {
    // Create a demo user with the specified role
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: `demo-${Date.now()}@example.com`,
      password: 'demo-password', // In a real app, generate a random password
      email_confirm: true, // Skip email verification for demo
      user_metadata: {
        full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role,
        is_demo: true,
      },
    });

    if (error) throw error;

    // Generate a JWT for the new user
    const token = jwt.sign(
      {
        sub: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata,
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create demo account',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

// Import auth routes
import authRoutes from './routes/auth';

// API Routes
app.use(authRoutes);
app.get('/api/search', (req, res) => {
  const rawQuery = req.query.q;
  const query = typeof rawQuery === 'string' ? rawQuery.trim().toLowerCase() : '';

  if (!query) {
    return res.json({ content: [], drops: [], users: [] });
  }

  const filterByQuery = (items: any[], fields: string[]) =>
    items.filter((item) =>
      fields.some((field) =>
        typeof item[field] === 'string' && item[field].toLowerCase().includes(query)
      )
    );

  const content = filterByQuery(SEARCH_CONTENT, ['title', 'description', 'platform', 'creator_name']);
  const drops = filterByQuery(SEARCH_DROPS, ['title', 'description', 'status']);
  const users = filterByQuery(SEARCH_USERS, ['username', 'display_name', 'user_type']);

  return res.json({ content, drops, users });
});
app.use('/api/content', contentRoutes);
app.use('/api/drops', dropsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/social-forecasts', socialForecastRoutes);
app.use('/api/advertisers', advertisersRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/referrals', require('./referrals'));
app.use('/api/marketplace', require('./marketplace'));
app.use('/api/social', require('./social'));
app.use('/api/manychat', require('./manychat'));
app.use('/api/operator', operatorRoutes);

// Auth profile endpoint (legacy, will be removed in future versions)
app.get('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
      ...req.user?.user_metadata
    },
  });
});

// Telemetry endpoint
app.post('/api/telemetry', (req, res) => {
  // Just acknowledge receipt of telemetry data
  res.json({ success: true });
});

// Error reporting endpoint
app.post('/api/report-error', (req, res) => {
  const { error, context, componentStack, timestamp, url, userAgent } = req.body;

  // Log the error for debugging/monitoring
  console.log('Frontend Error Report:', {
    message: error?.message,
    stack: error?.stack,
    context,
    componentStack,
    timestamp,
    url,
    userAgent,
    ip: req.ip,
  });

  // In a production system, you might want to:
  // - Store in database
  // - Send to error monitoring service (Sentry, LogRocket, etc.)
  // - Send email/notification to dev team

  res.json({ success: true });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(res, err, 'Unhandled error');
});

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider restarting the server or handling the error appropriately
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider restarting the server or handling the error appropriately
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
