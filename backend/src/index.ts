// Load environment variables before anything else
import 'dotenv/config';

// Import app after env is loaded
import { serve } from '@hono/node-server';
import app from './app';
import { config } from './config';

// Start the server
const server = serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`🚀 Server is running on http://localhost:${config.port}`);

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to exit the process or not
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Consider whether to exit the process or not
  // process.exit(1);
});
