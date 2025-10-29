const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-api-dev'
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
    message: error.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Promorang API development server running on port ${PORT}`);
  console.log(`📡 Frontend URL: http://localhost:5173`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
