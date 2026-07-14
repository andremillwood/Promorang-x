#!/usr/bin/env node
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const apply = process.argv.includes('--apply');
const MARKER = 'experience_commerce_controlled_qa_v1';

if (!url || !key) {
  console.error('Controlled activation: backend Supabase credentials are unavailable.');
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function selectFixtureContext() {
  const [momentsResult, couponsResult, usersResult] = await Promise.all([
    db.from('moments').select('id,title,host_id,status').order('created_at', { ascending: false }).limit(20),
    db.from('coupons').select('id,name,code,discount_type,discount_value,store_id,is_active,starts_at,expires_at,merchant_stores(user_id)').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
    db.from('users').select('id,email').limit(500),
  ]);
  if (momentsResult.error) throw momentsResult.error;
  if (couponsResult.error) throw couponsResult.error;
  if (usersResult.error) throw usersResult.error;

  const moment = (momentsResult.data || []).find((item) => item.host_id) || momentsResult.data?.[0];
  const now = Date.now();
  const validCoupons = (couponsResult.data || []).filter((item) =>
    (!item.starts_at || new Date(item.starts_at).getTime() <= now)
    && (!item.expires_at || new Date(item.expires_at).getTime() > now)
  );
  const coupon = validCoupons.find((item) => item.merchant_stores?.user_id) || validCoupons[0];
  const publicUsers = usersResult.data || [];
  const participant = publicUsers.find((user) => /demo|test/i.test(user.email || '') && user.id !== moment?.host_id && user.id !== coupon?.merchant_stores?.user_id);

  if (!moment) throw new Error('No Moment exists for controlled activation');
  if (!coupon) throw new Error('No active and unexpired coupon exists for controlled activation');
  if (!participant) throw new Error('No explicitly labeled demo/test participant is available for controlled activation');
  return { moment, coupon, participant };
}

async function main() {
  const { moment, coupon, participant } = await selectFixtureContext();
  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    marker: MARKER,
    moment: moment.id.slice(0, 8),
    coupon: coupon.id.slice(0, 8),
    participant: participant.id.slice(0, 8),
    actions: ['create live QA mission', 'connect coupon reward', 'submit controlled proof', 'approve through proof service', 'verify automation receipt'],
  };
  if (!apply) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  let { data: mission, error: missionLookupError } = await db
    .from('content_missions')
    .select('*')
    .contains('metadata', { qa_marker: MARKER })
    .maybeSingle();
  if (missionLookupError) throw missionLookupError;

  if (!mission) {
    const missionInsert = await db.from('content_missions').insert({
      moment_id: moment.id,
      owner_id: moment.host_id || coupon.merchant_stores?.user_id || participant.id,
      title: 'Controlled experience reward check',
      action_text: 'Complete the controlled Promorang experience verification.',
      publish_destination: 'Promorang QA',
      qualification_text: 'Reserved for the controlled end-to-end platform check.',
      proof_type: 'photo',
      reward_type: 'discount',
      reward_value: `${coupon.discount_value || ''}${coupon.discount_type === 'percentage' ? '%' : ''} coupon unlock`,
      participant_limit: 1,
      status: 'live',
      metadata: { qa_marker: MARKER, controlled: true, coupon_id: coupon.id },
    }).select().single();
    if (missionInsert.error) throw missionInsert.error;
    mission = missionInsert.data;
  }

  const linkOwner = coupon.merchant_stores?.user_id || moment.host_id || participant.id;
  const { data: priorQaLinks } = await db.from('experience_commerce_links').select('id,target_id').eq('source_type', 'mission').eq('source_id', mission.id).contains('attribution', { qa_marker: MARKER });
  for (const priorLink of priorQaLinks || []) {
    if (priorLink.target_id === coupon.id) continue;
    await db.from('experience_automation_runs').update({ status: 'skipped', error_message: null, result: { reason: 'qa_target_replaced' }, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('link_id', priorLink.id).eq('status', 'failed');
    await db.from('experience_commerce_links').delete().eq('id', priorLink.id);
  }
  const linkResult = await db.from('experience_commerce_links').upsert({
    source_type: 'mission',
    source_id: mission.id,
    target_type: 'offer',
    target_id: coupon.id,
    relationship: 'rewards',
    is_primary: true,
    created_by: linkOwner,
    attribution: { qa_marker: MARKER, controlled: true, target_kind: 'coupon' },
  }, { onConflict: 'source_type,source_id,target_type,target_id,relationship' }).select().single();
  if (linkResult.error) throw linkResult.error;

  let { data: proof, error: proofLookupError } = await db
    .from('proof_submissions')
    .select('*')
    .eq('user_id', participant.id)
    .eq('moment_id', moment.id)
    .contains('proof_bundle', { qa_marker: MARKER })
    .maybeSingle();
  if (proofLookupError) throw proofLookupError;

  if (!proof) {
    const proofInsert = await db.from('proof_submissions').insert({
      moment_id: moment.id,
      user_id: participant.id,
      proof_bundle: { qa_marker: MARKER, controlled: true, proof_type: 'qa_attestation', source_mission_id: mission.id },
      submission_state: 'pending',
    }).select().single();
    if (proofInsert.error) throw proofInsert.error;
    proof = proofInsert.data;
  }

  const participationResult = await db.from('mission_participations').upsert({
    mission_id: mission.id,
    user_id: participant.id,
    status: proof.submission_state === 'verified' ? 'rewarded' : 'submitted',
    proof_submission_id: proof.id,
    submitted_at: proof.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'mission_id,user_id' });
  if (participationResult.error) throw participationResult.error;

  if (proof.submission_state !== 'verified') {
    const proofService = require('../backend/services/proofService');
    await proofService.reviewProofSubmission({
      submissionId: proof.id,
      reviewerId: moment.host_id || linkOwner,
      action: 'approve',
      reviewReason: 'Controlled end-to-end experiential commerce activation',
    });
  } else {
    const automationService = require('../backend/services/experienceAutomationService');
    await automationService.processVerifiedProof({ proof, missionId: mission.id });
  }

  const [{ data: runs, error: runsError }, { data: receipts, error: receiptsError }] = await Promise.all([
    db.from('experience_automation_runs').select('id,status,result,error_message').eq('trigger_id', proof.id),
    db.from('commerce_receipts').select('id,status,receipt_type,redemption_code,attribution').eq('user_id', participant.id).contains('attribution', { proof_submission_id: proof.id }),
  ]);
  if (runsError) throw runsError;
  if (receiptsError) throw receiptsError;

  const completed = (runs || []).some((run) => run.status === 'completed');
  if (!completed || !(receipts || []).length) throw new Error('Controlled activation did not produce both a completed automation and attributed receipt');

  console.log(JSON.stringify({
    ...plan,
    mission: mission.id.slice(0, 8),
    proof: proof.id.slice(0, 8),
    automation_runs: runs.length,
    attributed_receipts: receipts.length,
    result: 'passed',
  }, null, 2));
}

main().catch((error) => {
  console.error(`Controlled activation failed: ${error.message}`);
  process.exit(1);
});
