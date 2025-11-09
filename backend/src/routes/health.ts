import { Hono } from 'hono';
import { db } from '../db';

const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  try {
    // Check database connection
    await db.users().select('*').limit(1);
    
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
});

export { healthRouter };
