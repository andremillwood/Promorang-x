import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

// PGlite runs a real PostgreSQL engine. Install it in a separate test prefix or
// provide PGLITE_MODULE=file:///absolute/path/to/@electric-sql/pglite/dist/index.js.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const baseline = await readFile(new URL('./baseline.sql', import.meta.url), 'utf8');
const oldViews = await readFile(new URL('./baseline-views.sql', import.meta.url), 'utf8');
const migration = await readFile(process.env.EVENT_MIGRATION_PATH || new URL('../../../supabase/migrations/20261120113704_public_event_discovery_and_claims.sql', import.meta.url), 'utf8');
const SOURCE = '10000000-0000-4000-8000-000000000001';
const BATCH = '10000000-0000-4000-8000-000000000002';
const OWNER = '20000000-0000-4000-8000-000000000001';
const RIVAL = '20000000-0000-4000-8000-000000000002';
const ADMIN = '20000000-0000-4000-8000-000000000003';
const start = `${new Date().getUTCFullYear() + 1}-01-15T12:00:00-05:00`;
const note = 'I represent the organizer and can verify ownership through the official organization website.';
const proof = 'https://organizer.example/about';
async function one(db, sql, values = []) { return (await db.query(sql, values)).rows[0]; }
async function system(db) { await db.exec('RESET ROLE'); await db.query("SELECT set_config('request.jwt.claim.sub','',false)"); }
async function user(db, id) { await db.exec('RESET ROLE; SET ROLE authenticated'); await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [id]); }
async function withDb(run) {
  const db = new PGlite();
  try {
    await db.exec(baseline + '\n' + oldViews);
    await db.exec(migration);
    await db.query("INSERT INTO auth.users(id) VALUES($1),($2),($3)", [OWNER, RIVAL, ADMIN]);
    await db.query("INSERT INTO public.users(id,role) VALUES($1,'user'),($2,'user'),($3,'admin')", [OWNER, RIVAL, ADMIN]);
    await db.query("INSERT INTO inventory_sources(id,source_key,name,source_type,attribution_text) VALUES($1,'official-test','Official Test Calendar','official_directory','Official Test Calendar')", [SOURCE]);
    await db.query("INSERT INTO inventory_import_batches(id,source_id) VALUES($1,$2)", [BATCH, SOURCE]);
    await db.query("INSERT INTO event_publication_policies(source_id,market_key,country_code,country_name,state,allowed_timezones,enabled) VALUES($1,'new-york','US','United States','New York',ARRAY['America/New_York'],true)", [SOURCE]);
    await run(db);
  } finally { await db.close(); }
}
async function stage(db, overrides = {}, options = {}) {
  const id = randomUUID();
  const d = { title:'Winter Community Fair', description:'Organizer-confirmed community event.',starts_at:start,ends_at:null,
    timezone:'America/New_York',city:'New York',state:'New York',country:'United States',country_code:'US',market_key:'new-york',
    venue_name:'Riverside Hall',venue_address:'123 River Road, New York, NY',venue_source_url:'https://venue.example/riverside',
    event_status:'scheduled',schedule_precision:'exact',...overrides };
  const sourceUrl = options.sourceUrl || `https://organizer.example/event/${id}`;
  await db.query("INSERT INTO inventory_candidates(id,batch_id,source_id,entity_type,source_record_id,source_url,raw_data,normalized_data,fingerprint,confidence,review_status,country_code) VALUES($1,$2,$3,'moment',$4,$5,'{}',$6,$7,$8,$9,$10)",
    [id,BATCH,SOURCE,id,sourceUrl,JSON.stringify(d),randomUUID(),options.confidence ?? 1,options.review ?? 'approved',d.country_code]);
  if (options.evidence !== false) {
    const facts = {title:d.title,starts_at:d.starts_at,ends_at:d.ends_at,timezone:d.timezone,city:d.city,state:d.state,country_code:d.country_code,event_status:d.event_status,
      venue_name:d.venue_name,venue_address:d.venue_address};
    for (const url of new Set([sourceUrl,d.venue_source_url])) await db.query(
      "INSERT INTO event_candidate_evidence(inventory_candidate_id,source_url,source_name,evidence_type,observed_facts,is_authoritative) VALUES($1,$2,'Organizer','organizer_page',$3,$4)",
      [id,url,JSON.stringify(facts),options.authoritative !== false]);
  }
  return id;
}
async function publish(db,id) { return (await one(db,'SELECT public.publish_discovered_event_candidate($1) AS id',[id])).id; }
async function request(db,type,id) { return (await one(db,'SELECT public.request_imported_listing_claim($1,$2,$3,$4) AS id',[type,id,note,proof])).id; }
async function review(db,id,decision='approved') { return one(db,'SELECT public.admin_review_imported_listing_claim($1,$2,$3) AS result',[id,decision,'Verified the applicant through the official organization contact.']); }

test('verified publication creates a public unclaimed Moment and one canonical claimable venue with accurate geography', () => withDb(async db => {
  const id=await publish(db,await stage(db,{ticket_status:'sold_out'}));
  const row=await one(db,'SELECT * FROM moments WHERE id=$1',[id]);
  assert.equal(row.claim_status,'unclaimed'); assert.equal(row.ownership_status,'unclaimed'); assert.equal(row.host_id,null);
  assert.equal(row.ends_at,null); assert.equal(row.recurrence_timezone,'America/New_York'); assert.equal(row.country_code,'US');
  const venue=await one(db,'SELECT v.id,v.claim_status,p.is_claimed,p.data_source FROM venues v JOIN pre_populated_venues p USING(id) WHERE v.id=$1',[row.venue_id]);
  assert.equal(venue.claim_status,'unclaimed'); assert.equal(venue.is_claimed,false); assert.equal(venue.data_source,'official-test');
  const pub=await one(db,'SELECT * FROM view_public_moment_directory WHERE id=$1',[id]);
  assert.equal(pub.state,'New York'); assert.equal(pub.market_key,'new-york'); assert.equal(pub.ticket_status,'sold_out'); assert.ok(pub.venue_slug);
  const dir=await one(db,'SELECT * FROM view_public_venue_directory WHERE id=$1',[row.venue_id]);
  assert.equal(dir.active_moments_count,1); assert.equal(dir.listing_status,'unclaimed');
}));

test('unverified events and unverified venue addresses fail atomically', () => withDb(async db => {
  for (const opts of [{evidence:false},{authoritative:false}]) {
    const c=await stage(db,{},opts); await assert.rejects(publish(db,c),/Authoritative evidence/);
  }
  const c=await stage(db); await db.query("DELETE FROM event_candidate_evidence WHERE inventory_candidate_id=$1 AND source_url='https://venue.example/riverside'",[c]);
  await assert.rejects(publish(db,c),/actual venue address/);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM moments')).n,0);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM venues')).n,0);
}));

test('policy opt-in, confidence, fresh evidence, and local UTC offset are enforced', () => withDb(async db => {
  const low=await stage(db,{}, {confidence:.8}); await assert.rejects(publish(db,low),/high-confidence/);
  const wrongOffset=await stage(db,{starts_at:start.replace('-05:00','+00:00')}); await assert.rejects(publish(db,wrongOffset),/offset conflicts/);
  const old=await stage(db); await db.query("UPDATE event_candidate_evidence SET checked_at=now()-interval '8 days' WHERE inventory_candidate_id=$1",[old]);
  await assert.rejects(publish(db,old),/Authoritative evidence/);
  const disabled=await stage(db); await db.exec('UPDATE event_publication_policies SET enabled=false');
  await assert.rejects(publish(db,disabled),/not enabled/);
}));

test('simultaneously submitted duplicate retries produce one Moment and preserve its primary source', () => withDb(async db => {
  const a=await stage(db),b=await stage(db);
  // PGlite serializes one connection. These concurrent promises test queued
  // retry idempotency; true multi-session locking additionally needs Postgres.
  const ids=await Promise.all([publish(db,a),publish(db,b),publish(db,a)]);
  assert.equal(new Set(ids).size,1);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM moments')).n,1);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM venues')).n,1);
  assert.equal((await one(db,'SELECT inventory_candidate_id FROM moments')).inventory_candidate_id,a);
  assert.equal((await one(db,'SELECT published_record_id FROM inventory_candidates WHERE id=$1',[b])).published_record_id,ids[0]);
}));

test('same title, city, and time at different venues creates distinct events', () => withDb(async db => {
  const a=await publish(db,await stage(db));
  const b=await publish(db,await stage(db,{venue_name:'Uptown Hall',venue_address:'456 Hill Street, New York, NY',venue_source_url:'https://venue.example/uptown'}));
  assert.notEqual(a,b); assert.equal((await one(db,'SELECT count(*)::int AS n FROM moments')).n,2);
}));

test('explicit venue IDs cannot cross countries or overwrite conflicting legacy identity', () => withDb(async db => {
  const venue=randomUUID();
  await db.query("INSERT INTO venues(id,venue_name,address,city,state,country,claim_status) VALUES($1,'Riverside Hall','123 River Road','New York','New York','Jamaica','unclaimed')",[venue]);
  await assert.rejects(publish(db,await stage(db,{venue_id:venue})),/conflicts with the verified venue/);
  await db.query("UPDATE venues SET country='United States',claim_status='claimed' WHERE id=$1",[venue]);
  await assert.rejects(publish(db,await stage(db,{venue_id:venue})),/Legacy venue claim state is ambiguous/);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM moments')).n,0);
}));

test('inactive, cancelled, and owner-controlled events are never reactivated or reset', () => withDb(async db => {
  const c=await stage(db); const id=await publish(db,c);
  await db.query("UPDATE moments SET is_active=false,status='cancelled' WHERE id=$1",[id]);
  await assert.rejects(publish(db,c),/owned, reserved, inactive, or retired/);
  assert.deepEqual(await one(db,'SELECT is_active,status::text FROM moments WHERE id=$1',[id]),{is_active:false,status:'cancelled'});
  await db.query("UPDATE moments SET is_active=true,status='scheduled',host_id=$2,claim_status='claimed',ownership_status='owned' WHERE id=$1",[id,OWNER]);
  await assert.rejects(publish(db,c),/owned, reserved, inactive, or retired/);
  assert.equal((await one(db,'SELECT host_id FROM moments WHERE id=$1',[id])).host_id,OWNER);
}));

test('anonymous publisher access and direct authenticated ownership takeover are closed', () => withDb(async db => {
  const c=await stage(db),id=await publish(db,c);
  await db.exec('SET ROLE anon'); await assert.rejects(publish(db,c),/permission denied/);
  await assert.rejects(db.query('SELECT public.publish_approved_event_candidate($1)',[c]),/permission denied/);
  await user(db,RIVAL);
  const result=await db.query("UPDATE moments SET claim_status='claimed',claimed_by=$2,host_id=$2,title='Hijacked' WHERE id=$1 RETURNING id",[id,RIVAL]);
  assert.equal(result.rows.length,0);
  await system(db); assert.equal((await one(db,'SELECT host_id FROM moments WHERE id=$1',[id])).host_id,null);
}));

test('claims remain private requests until admin review; competing applicants cannot each gain ownership', () => withDb(async db => {
  const c=await stage(db),id=await publish(db,c);
  await user(db,OWNER); const a=await request(db,'moment',id); assert.equal(await request(db,'moment',id),a);
  await user(db,RIVAL); const b=await request(db,'moment',id);
  assert.equal((await db.query('SELECT * FROM imported_listing_claims')).rows.length,1);
  assert.equal((await db.query('SELECT * FROM list_my_imported_listing_claims()')).rows.length,1);
  await assert.rejects(review(db,b),/Admin access required/);
  await system(db); assert.equal((await one(db,'SELECT host_id FROM moments WHERE id=$1',[id])).host_id,null);
  await user(db,ADMIN); await review(db,a); await assert.rejects(review(db,b),/already been reviewed/);
  await system(db); const m=await one(db,'SELECT host_id,organizer_id,claimed_by,ownership_status,claim_status FROM moments WHERE id=$1',[id]);
  assert.deepEqual(m,{host_id:OWNER,organizer_id:OWNER,claimed_by:OWNER,ownership_status:'owned',claim_status:'claimed'});
  assert.equal((await one(db,'SELECT status FROM imported_listing_claims WHERE id=$1',[b])).status,'rejected');
  await assert.rejects(publish(db,c),/owned, reserved, inactive, or retired/);
}));

test('venue approval preserves UUID across canonical, imported, and public owner profiles; only the approved owner can edit', () => withDb(async db => {
  const event=await publish(db,await stage(db)); const id=(await one(db,'SELECT venue_id FROM moments WHERE id=$1',[event])).venue_id;
  await user(db,OWNER); const claim=await request(db,'venue',id);
  await assert.rejects(db.query('SELECT update_claimed_venue_profile($1,$2,$3,$4,$5)',[id,'New Name','Text','https://venue.example','555-0101']),/Only the approved/);
  await user(db,ADMIN); await review(db,claim);
  await user(db,RIVAL); assert.equal((await one(db,'SELECT get_my_claimed_venue_profile($1) AS profile',[id])).profile,null);
  await assert.rejects(db.query('SELECT update_claimed_venue_profile($1,$2,$3,$4,$5)',[id,'Wrong Name','Text','https://venue.example','555-0101']),/Only the approved/);
  await user(db,OWNER); const updated=await one(db,'SELECT update_claimed_venue_profile($1,$2,$3,$4,$5) AS profile',[id,'Riverside Hall Official','Owner-written description','https://venue.example/official','555-0101']);
  assert.equal(updated.profile.name,'Riverside Hall Official'); assert.equal(updated.profile.id,id);
  await system(db); const canonical=await one(db,'SELECT owner_id,claimed_by,city,address FROM venues WHERE id=$1',[id]);
  assert.equal(canonical.owner_id,OWNER); assert.equal(canonical.city,'New York'); assert.equal(canonical.address,'123 River Road, New York, NY');
  assert.equal((await one(db,'SELECT is_claimed FROM pre_populated_venues WHERE id=$1',[id])).is_claimed,true);
  const directory=await db.query('SELECT id,listing_status,name FROM view_public_venue_directory WHERE id=$1',[id]);
  assert.equal(directory.rows.length,1); assert.equal(directory.rows[0].listing_status,'claimed');
  assert.equal((await one(db,'SELECT venue_id FROM moments WHERE id=$1',[event])).venue_id,id);
}));

test('email-reserved owner invitations remain authoritative and admins cannot approve themselves', () => withDb(async db => {
  const id=await publish(db,await stage(db));
  await db.query("INSERT INTO page_ownership_claims(entity_type,entity_id,status,intended_owner_email,created_by) VALUES('moment',$1,'available','owner@example.test',$2)",[id,ADMIN]);
  await user(db,OWNER); await assert.rejects(request(db,'moment',id),/not available/);
  await system(db); await db.exec('DELETE FROM page_ownership_claims');
  await user(db,ADMIN); const self=await request(db,'moment',id); await assert.rejects(review(db,self),/different administrator/);
}));

test('public target lookup does not reveal private or stakeholder-only titles', () => withDb(async db => {
  const id=await publish(db,await stage(db)); await db.query("UPDATE moments SET visibility='private',title='Private secret event' WHERE id=$1",[id]);
  await db.exec('SET ROLE anon'); const target=(await one(db,"SELECT get_imported_listing_claim_target('moment',$1) AS target",[id])).target;
  assert.equal(target.claimable,false); assert.equal(target.display_name,null); assert.equal(target.public_path,null);
  assert.equal((await db.query('SELECT * FROM view_public_moment_directory WHERE id=$1',[id])).rows.length,0);
}));

test('authentication identities without matching public users cannot request FK-invalid ownership', () => withDb(async db => {
  const id=await publish(db,await stage(db)),authOnly=randomUUID(); await db.query('INSERT INTO auth.users(id) VALUES($1)',[authOnly]);
  await user(db,authOnly); await assert.rejects(request(db,'moment',id),/Complete your Promorang profile/);
}));

test('country aliases and a market with two timezones remain correctly scoped', () => withDb(async db => {
  for (const [name,code] of [['Jamaica','JM'],['Trinidad and Tobago','TT'],['Barbados','BB'],['The Bahamas','BS'],['Guyana','GY'],['Ghana','GH'],['Dominican Republic','DO'],['Colombia','CO'],['Panama','PA'],['United Kingdom','GB']]) {
    assert.equal((await one(db,'SELECT app_private.country_key($1) AS code',[name])).code,code);
  }
  await db.query("INSERT INTO event_publication_policies(source_id,market_key,country_code,country_name,state,allowed_timezones,enabled) VALUES($1,'florida','US','United States','Florida',ARRAY['America/New_York','America/Chicago'],true)",[SOURCE]);
  const c=await stage(db,{city:'Pensacola',state:'Florida',market_key:'florida',timezone:'America/Chicago',starts_at:start.replace('-05:00','-06:00'),venue_address:'123 River Road, Pensacola, FL'});
  const id=await publish(db,c); assert.equal((await one(db,'SELECT recurrence_timezone FROM moments WHERE id=$1',[id])).recurrence_timezone,'America/Chicago');
}));

test('identical city/street/venue names in different states never merge', () => withDb(async db => {
  await db.query("INSERT INTO event_publication_policies(source_id,market_key,country_code,country_name,state,allowed_timezones,enabled) VALUES($1,'florida','US','United States','Florida',ARRAY['America/New_York'],true)",[SOURCE]);
  const a=await publish(db,await stage(db,{city:'Springfield',venue_address:'123 River Road, Springfield'}));
  const b=await publish(db,await stage(db,{city:'Springfield',state:'Florida',market_key:'florida',venue_address:'123 River Road, Springfield'}));
  assert.notEqual(a,b);
  const venues=await db.query('SELECT venue_id FROM moments WHERE id IN ($1,$2)',[a,b]);
  assert.equal(new Set(venues.rows.map(x=>x.venue_id)).size,2);
}));

test('expiry archives source-owned rows using a valid status while preserving approved owners and cancellations', () => withDb(async db => {
  const c=await stage(db),unclaimed=await publish(db,c);
  const ownedCandidate=await stage(db,{title:'Owner Event'}),owned=await publish(db,ownedCandidate);
  await user(db,OWNER); const claim=await request(db,'moment',owned); await user(db,ADMIN); await review(db,claim); await system(db);
  const cancelled=await publish(db,await stage(db,{title:'Cancelled Event'}));
  await db.query("UPDATE moments SET status='cancelled' WHERE id=$1",[cancelled]);
  await db.exec("UPDATE moments SET starts_at=now()-interval '3 days',ends_at=now()-interval '2 days'; UPDATE inventory_candidates SET expires_at=now()-interval '1 day'");
  await db.query('SELECT expire_stale_imported_moments()');
  assert.deepEqual(await one(db,'SELECT status::text,is_active FROM moments WHERE id=$1',[unclaimed]),{status:'archived',is_active:false});
  assert.deepEqual(await one(db,'SELECT status::text,is_active,host_id FROM moments WHERE id=$1',[owned]),{status:'scheduled',is_active:true,host_id:OWNER});
  assert.equal((await one(db,'SELECT lifecycle_status FROM inventory_candidates WHERE id=$1',[ownedCandidate])).lifecycle_status,'current');
  assert.equal((await one(db,'SELECT status::text FROM moments WHERE id=$1',[cancelled])).status,'cancelled');
  await db.query("UPDATE inventory_candidates SET lifecycle_status='expired' WHERE id=$1",[ownedCandidate]);
  assert.equal((await db.query('SELECT id FROM view_public_moment_directory WHERE id=$1',[owned])).rows.length,1);
}));

test('venue claim review rejects a state mismatch and publication rejects an owned canonical/unclaimed directory conflict', () => withDb(async db => {
  const event=await publish(db,await stage(db)); const id=(await one(db,'SELECT venue_id FROM moments WHERE id=$1',[event])).venue_id;
  await user(db,OWNER); const claim=await request(db,'venue',id);
  await system(db); await db.query("UPDATE venues SET state='Florida' WHERE id=$1",[id]);
  await user(db,ADMIN); await assert.rejects(review(db,claim),/ownership or availability changed/);
  await system(db); assert.equal((await one(db,'SELECT owner_id FROM venues WHERE id=$1',[id])).owner_id,null);
  await db.query("UPDATE venues SET state='New York',owner_id=$2,claim_status='claimed' WHERE id=$1",[id,OWNER]);
  await assert.rejects(publish(db,await stage(db,{title:'Second verified event'})),/Conflicting venue claim representations/);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM venue_profiles WHERE id=$1',[id])).n,0);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM moments')).n,1);
}));
