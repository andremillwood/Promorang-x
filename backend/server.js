const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware with preflight handling
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    process.env.FRONTEND_URL
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

// Mock supabase for development
global.supabase = null;

// API routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/users', require('./api/users'));
app.use('/api/content', require('./api/content'));
app.use('/api/drops', require('./api/drops'));
app.use('/api/social-forecasts', require('./api/social-forecasts'));
app.use('/api/advertisers', require('./api/advertisers'));
app.use('/api/growth', require('./api/growth'));
app.use('/api/portfolio', require('./api/portfolio'));
app.use('/api/shares', require('./api/shares'));
app.use('/api/placeholder', require('./api/placeholder'));

// Demo login endpoint (bypasses default body parser)
app.use('/api/demo', require('./api/demo-login'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-api-dev'
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
app.listen(PORT, HOST, () => {
  console.log(`🚀 Promorang API development server running on ${HOST}:${PORT}`);
  console.log(`📡 Frontend URL: http://localhost:5000`);
  console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
});
