#!/usr/bin/env node

import('../dist/index.js').catch((err) => {
  console.error('[Promorang MCP] Failed to start:', err);
  process.exit(1);
});
