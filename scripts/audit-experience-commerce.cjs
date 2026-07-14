#!/usr/bin/env node
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const strict = process.argv.includes('--strict');

if (!url || !key) {
  console.error('Experience commerce audit: backend Supabase credentials are unavailable.');
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const requiredTables = [
  'experience_commerce_links',
  'experience_automation_runs',
  'commerce_receipts',
  'proof_submissions',
  'content_missions',
  'mission_participations',
  'merchant_products',
  'coupons',
  'coupon_redemptions',
];

async function main() {
  const report = { schema: {}, counts: {}, attention: {} };
  let critical = 0;

  for (const table of requiredTables) {
    const { error } = await db.from(table).select('*').limit(1);
    report.schema[table] = error ? `missing: ${error.message}` : 'ready';
    if (error) critical += 1;
  }

  if (critical > 0) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const [links, runs, receipts, proofs] = await Promise.all([
    db.from('experience_commerce_links').select('*').limit(2000),
    db.from('experience_automation_runs').select('*').order('created_at', { ascending: false }).limit(2000),
    db.from('commerce_receipts').select('id,status,receipt_type,listing_id,coupon_id,moment_id,mission_id,campaign_id,attribution,created_at').order('created_at', { ascending: false }).limit(2000),
    db.from('proof_submissions').select('id,moment_id,user_id,submission_state,proof_bundle,reviewed_at').eq('submission_state', 'verified').order('reviewed_at', { ascending: false }).limit(500),
  ]);

  for (const result of [links, runs, receipts, proofs]) {
    if (result.error) throw result.error;
  }

  const linkRows = links.data || [];
  const runRows = runs.data || [];
  const receiptRows = receipts.data || [];
  const proofRows = proofs.data || [];
  const automatedLinks = linkRows.filter((link) => ['rewards', 'unlocks', 'eligible_for'].includes(link.relationship));
  const runTriggerIds = new Set(runRows.map((run) => run.trigger_id));

  const proofHasAutomatedLink = (proof) => {
    const bundle = proof.proof_bundle || {};
    const refs = new Set([
      proof.moment_id && `moment:${proof.moment_id}`,
      (bundle.source_mission_id || bundle.mission_id) && `mission:${bundle.source_mission_id || bundle.mission_id}`,
      (bundle.source_content_id || bundle.content_id) && `content:${bundle.source_content_id || bundle.content_id}`,
      bundle.campaign_id && `campaign:${bundle.campaign_id}`,
    ].filter(Boolean));
    return automatedLinks.some((link) => refs.has(`${link.source_type}:${link.source_id}`));
  };

  const missingRuns = proofRows.filter((proof) => proofHasAutomatedLink(proof) && !runTriggerIds.has(proof.id));
  const failedRuns = runRows.filter((run) => run.status === 'failed');
  const staleRuns = runRows.filter((run) => run.status === 'processing' && run.started_at < cutoff);
  const automaticReceipts = receiptRows.filter((receipt) => receipt.attribution?.source === 'verified_proof_unlock');
  const weakAttribution = automaticReceipts.filter((receipt) => !receipt.attribution?.proof_submission_id || !receipt.attribution?.experience_link_id);

  report.counts = {
    experience_links: linkRows.length,
    automated_links: automatedLinks.length,
    verified_proofs_sampled: proofRows.length,
    automation_runs: runRows.length,
    completed_automations: runRows.filter((run) => run.status === 'completed').length,
    automatic_receipts: automaticReceipts.length,
  };

  const candidateTables = ['moments', 'content_missions', 'merchant_products', 'coupons'];
  for (const table of candidateTables) {
    const { count, error } = await db.from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    report.counts[table] = count || 0;
  }
  report.attention = {
    configuration_needed: report.counts.experience_links === 0 && (report.counts.merchant_products > 0 || report.counts.coupons > 0) ? 1 : 0,
    verified_proofs_awaiting_reconciliation: missingRuns.length,
    failed_automations: failedRuns.length,
    stale_processing_automations: staleRuns.length,
    automatic_receipts_missing_attribution: weakAttribution.length,
  };

  console.log(JSON.stringify(report, null, 2));
  const attentionTotal = Object.values(report.attention).reduce((sum, count) => sum + count, 0);
  if (strict && attentionTotal > 0) process.exit(2);
}

main().catch((error) => {
  console.error(`Experience commerce audit failed: ${error.message}`);
  process.exit(1);
});
