#!/usr/bin/env node

const { reconcile } = require('../services/canonicalReconciliationService');

function argument(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((item) => item.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function main() {
  const since = argument('since');
  const strict = process.argv.includes('--strict');

  if (!since) {
    console.error('Usage: node scripts/reconcile-canonical-events.js --since=<ISO timestamp> [--strict]');
    process.exitCode = 2;
    return;
  }

  const result = await reconcile({ since });
  console.log(JSON.stringify(result, null, 2));

  if (strict && result.status !== 'reconciled') process.exitCode = 1;
}

main().catch((error) => {
  console.error('[Canonical Reconciliation] failed:', error);
  process.exitCode = 1;
});
