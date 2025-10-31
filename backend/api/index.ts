import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { corsMw, corsPreflightHandler } from './_core/cors';
import { requireAuth } from './_core/auth';
import { supabaseAdmin } from './_core/supabase';
import jwt from 'jsonwebtoken';

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
  if (!['creator', 'advertiser'].includes(role)) {
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
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create demo account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Protected route example
app.get('/api/users/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      // Add other user properties as needed
    },
  });
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
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
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
