import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRouter } from './routes/auth';
import { growthRouter } from './routes/growth';
import { healthRouter } from './routes/health';
import { eventsRouter } from './routes/events';
import { authMiddleware } from './auth/middleware';
import { config } from './config';

const resolveAllowedOrigins = () => {
  if (config.nodeEnv === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }

  const base = config.frontendUrl?.replace(/\/+$/, '');
  if (!base) return undefined;

  const variants = new Set<string>([base]);

  if (base.includes('://www.')) {
    variants.add(base.replace('://www.', '://'));
  } else {
    variants.add(base.replace('://', '://www.'));
  }

  return Array.from(variants);
};

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: resolveAllowedOrigins(),
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Health check route (no auth required)
app.route('/health', healthRouter);

// Auth routes (no auth required)
app.route('/auth', authRouter);

// Apply auth middleware to all other routes
app.use('*', authMiddleware);

// Growth hub routes (require auth)
app.route('/api/growth', growthRouter);

// Events routes (require auth)
app.route('/api/events', eventsRouter);


// Example protected route
app.get('/api/me', async (c) => {
  const userId = c.get('userId');
  return c.json({ userId });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Start server
const port = config.port;
console.log(`🚀 Server running on port ${port}`);

// Export the app for use in index.ts
export default app;

// For local development
if (process.env.NODE_ENV !== 'test') {
  // @ts-ignore - This is for local development
  if (import.meta.env?.PROD) {
    // @ts-ignore
    import('@hono/node-server').then(({ serve }) => {
      serve({
        fetch: app.fetch,
        port,
      });
    });
  }
}
