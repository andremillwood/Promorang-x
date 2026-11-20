import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const baseline = await readFile(new URL('./baseline.sql', import.meta.url), 'utf8');
const oldViews = await readFile(new URL('./baseline-views.sql', import.meta.url), 'utf8');
const migration = await readFile(new URL('../../../supabase/migrations/20261120113704_public_event_discovery_and_claims.sql', import.meta.url), 'utf8');
const seed = await readFile(new URL('../../events/enable-approved-discovery-markets.sql', import.meta.url), 'utf8');
const scopeConfig = JSON.parse(await readFile(new URL('../../../data/events/discovery-policy.json', import.meta.url), 'utf8'));

// Independently enumerated registered source keys. Synthetic IDs exercise the
// seed's lookup by stable source key without copying any production records.
const registeredSources = {
  jamaica: ['visitjamaica-events', 'touchstone-link-events'],
  'trinidad-and-tobago': ['queens-hall-tt-events'],
  barbados: ['visit-barbados-events'],
  bahamas: ['nassau-paradise-island-events'],
  guyana: ['guyana-tourism-events'],
  ghana: ['visit-ghana-events'],
  'dominican-republic': ['go-dominican-republic-events'],
  colombia: ['medellin-travel-events', 'bogota-cultural-agenda'],
  panama: ['visit-panama-events'],
  'us-florida': ['visit-florida-events', 'miami-beaches-events', 'visit-lauderdale-events', 'palm-beaches-events', 'visit-orlando-events', 'visit-tampa-bay-events', 'visit-jacksonville-events', 'art-basel-miami-events'],
  'us-georgia': ['explore-georgia-events', 'discover-atlanta-events', 'visit-savannah-events', 'visit-athens-events', 'visit-augusta-events', 'atlanta-track-club-events'],
  'us-new-york': ['iloveny-events', 'nyc-tourism-events', 'dciny-events'],
  'us-michigan': ['pure-michigan-events', 'visit-detroit-events', 'destination-ann-arbor-events', 'experience-grand-rapids-events', 'detroit-symphony-events'],
  'gb-london': ['visit-london-events', 'barbican-events'],
};
const countryByMarket = {
  jamaica:'JM','trinidad-and-tobago':'TT',barbados:'BB',bahamas:'BS',guyana:'GY',ghana:'GH',
  'dominican-republic':'DO',colombia:'CO',panama:'PA','us-florida':'US','us-georgia':'US','us-new-york':'US','us-michigan':'US','gb-london':'GB',
};
const OWNER = '29000000-0000-4000-8000-000000000001';
const ADMIN = '29000000-0000-4000-8000-000000000002';
async function one(db, sql, values = []) { return (await db.query(sql, values)).rows[0]; }

async function withDb(run) {
  const db = new PGlite();
  try {
    await db.exec(baseline + '\n' + oldViews);
    await db.exec(migration);
    for (const key of Object.values(registeredSources).flat()) {
      await db.query("INSERT INTO inventory_sources(source_key,name,source_type,metadata) VALUES($1,$1,'official_directory',$2)",
        [key, JSON.stringify({ auto_publish:false, operator_setting:'preserve this value' })]);
    }
    await db.query("INSERT INTO inventory_sources(source_key,name,source_type,metadata) VALUES('unrelated-directory','Unrelated directory','official_directory','{\"keep\":true}')");
    await db.query('INSERT INTO auth.users(id) VALUES($1),($2)', [OWNER,ADMIN]);
    await db.query("INSERT INTO public.users(id,role) VALUES($1,'user'),($2,'admin')", [OWNER,ADMIN]);
    const venueId=randomUUID();
    await db.query("INSERT INTO venues(id,owner_id,claimed_by,venue_name,venue_slug,address,city,state,country,claim_status) VALUES($1,$2,$2,'Owner Curated Hall','owner-curated-hall','1 Owner Avenue','New York','New York','United States','claimed')",[venueId,OWNER]);
    await db.query("INSERT INTO pre_populated_venues(id,venue_name,venue_slug,address,city,state,country,is_claimed,claimed_by,source_url) VALUES($1,'Owner Curated Hall','owner-curated-hall','1 Owner Avenue','New York','New York','United States',true,$2,'https://venue.example/owner')",[venueId,OWNER]);
    await db.query("INSERT INTO venue_profiles(id,name,slug,address,city,country,description) VALUES($1,'Owner Curated Hall','owner-curated-hall','1 Owner Avenue','New York','United States','Owner-written profile')",[venueId]);
    await db.query("INSERT INTO moments(title,venue_id,host_id,organizer_id,claimed_by,ownership_status,claim_status,content_origin,status,description) VALUES('Owner controlled Moment',$1,$2,$2,$2,'owned','claimed','imported','scheduled','Preserve my own event description')",[venueId,OWNER]);
    await db.query("INSERT INTO moments(title,ownership_status,claim_status,content_origin,status,is_active) VALUES('Retired source listing','unclaimed','unclaimed','imported','cancelled',false)");
    await db.query("INSERT INTO imported_listing_claims(entity_type,entity_id,display_name,claimant_id,status,claimant_note,evidence_url,reviewed_by,reviewed_at,review_note) VALUES('venue',$1,'Owner Curated Hall',$2,'approved','I am the actual approved venue owner.','https://venue.example/owner',$3,now(),'Verified actual owner')",[venueId,OWNER,ADMIN]);
    await run(db);
  } finally { await db.close(); }
}

async function protectedSnapshot(db) {
  const snapshot={};
  for (const table of ['venues','pre_populated_venues','venue_profiles','moments','imported_listing_claims','inventory_candidates']) {
    snapshot[table]=(await db.query(`SELECT to_jsonb(t) AS data FROM public.${table} t ORDER BY id`)).rows;
  }
  return snapshot;
}

test('approved seed creates exactly 35 source policies across 14 authorized scopes with consistent country and timezone mappings', () => withDb(async db => {
  const before=await protectedSnapshot(db);
  await db.exec(seed);
  const rows=(await db.query("SELECT s.source_key,p.*,app_private.country_key(p.country_name) AS normalized_country FROM event_publication_policies p JOIN inventory_sources s ON s.id=p.source_id ORDER BY p.market_key,s.source_key")).rows;
  assert.equal(rows.length,35);
  assert.equal(new Set(rows.map(p=>p.market_key)).size,14);
  for (const [market,keys] of Object.entries(registeredSources)) {
    const scoped=rows.filter(p=>p.market_key===market);
    assert.deepEqual(scoped.map(p=>p.source_key).sort(),[...keys].sort());
    for (const p of scoped) {
      assert.equal(p.enabled,true); assert.equal(Number(p.minimum_confidence),.95); assert.equal(p.max_evidence_age_hours,24);
      assert.equal(p.country_code,countryByMarket[market]); assert.equal(p.normalized_country,p.country_code);
      assert.equal((await one(db,'SELECT count(*)::int AS n FROM unnest($1::text[]) z(name) WHERE NOT EXISTS(SELECT 1 FROM pg_timezone_names t WHERE t.name=z.name)',[p.allowed_timezones])).n,0);
    }
  }
  // Cross-check the five expansions against the independently maintained policy
  // config, including each state's second timezone and Greater London's scope.
  for (const configured of scopeConfig.markets) {
    for (const p of rows.filter(p=>p.market_key===configured.key)) {
      assert.equal(p.country_code,configured.country_code); assert.equal(p.state,configured.state);
      assert.deepEqual([...p.allowed_timezones].sort(),[...configured.allowed_timezones].sort());
    }
  }
  const offsets=(await db.query("SELECT z, extract(epoch FROM (timestamp '2027-01-15 12:00:00' - (timestamp '2027-01-15 12:00:00' AT TIME ZONE z AT TIME ZONE 'UTC')))/3600 AS winter, extract(epoch FROM (timestamp '2027-07-15 12:00:00' - (timestamp '2027-07-15 12:00:00' AT TIME ZONE z AT TIME ZONE 'UTC')))/3600 AS summer FROM unnest(ARRAY['America/New_York','America/Chicago','America/Detroit','America/Menominee','Europe/London']) z")).rows;
  assert.deepEqual(Object.fromEntries(offsets.map(x=>[x.z,[Number(x.winter),Number(x.summer)]])),{
    'America/New_York':[-5,-4],'America/Chicago':[-6,-5],'America/Detroit':[-5,-4],'America/Menominee':[-6,-5],'Europe/London':[0,1],
  });
  assert.deepEqual(await protectedSnapshot(db),before);
  const sourceMetadata=(await db.query("SELECT metadata FROM inventory_sources WHERE source_key<>'unrelated-directory'")).rows;
  for (const {metadata} of sourceMetadata) {
    assert.equal(metadata.auto_publish,false); assert.equal(metadata.operator_setting,'preserve this value');
    assert.equal(metadata.event_auto_publish_verified,true); assert.equal(metadata.event_publication_policy_source,'event_publication_policies');
  }
  assert.deepEqual((await one(db,"SELECT metadata FROM inventory_sources WHERE source_key='unrelated-directory'")).metadata,{keep:true});
}));

test('re-running the seed preserves paused/customized policies, effective publisher denial, owner content, claims, and retired records', () => withDb(async db => {
  await db.exec(seed);
  await db.exec("UPDATE event_publication_policies SET enabled=false,minimum_confidence=1,max_evidence_age_hours=12 WHERE source_id=(SELECT id FROM inventory_sources WHERE source_key='visit-london-events')");
  const beforePolicies=(await db.query('SELECT to_jsonb(p) AS data FROM event_publication_policies p ORDER BY source_id,market_key')).rows;
  const beforeOwners=await protectedSnapshot(db);
  await db.exec(seed);
  assert.deepEqual((await db.query('SELECT to_jsonb(p) AS data FROM event_publication_policies p ORDER BY source_id,market_key')).rows,beforePolicies);
  assert.deepEqual(await protectedSnapshot(db),beforeOwners);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM event_publication_policies')).n,35);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM event_publication_policies WHERE enabled')).n,34);
  // The policy table remains the authoritative gate even if the source carries
  // event-discovery metadata left from its earlier enabled state.
  const source=(await one(db,"SELECT id FROM inventory_sources WHERE source_key='visit-london-events'")).id;
  const batch=(await one(db,'INSERT INTO inventory_import_batches(source_id) VALUES($1) RETURNING id',[source])).id;
  const candidate=(await one(db,"INSERT INTO inventory_candidates(batch_id,source_id,entity_type,source_record_id,raw_data,normalized_data,fingerprint,confidence,review_status,country_code) VALUES($1,$2,'moment','paused-policy-example','{}','{\"market_key\":\"gb-london\"}','paused-policy-example',1,'approved','GB') RETURNING id",[batch,source])).id;
  await assert.rejects(db.query('SELECT publish_discovered_event_candidate($1)',[candidate]),/not enabled for this source and market/);
}));

test('missing, disabled, and unrelated sources never receive new publication authorization', () => withDb(async db => {
  await db.exec("UPDATE inventory_sources SET enabled=false WHERE source_key='barbican-events'; DELETE FROM inventory_sources WHERE source_key='dciny-events'");
  await db.exec(seed);
  assert.equal((await one(db,'SELECT count(*)::int AS n FROM event_publication_policies')).n,33);
  assert.equal((await one(db,'SELECT count(DISTINCT market_key)::int AS n FROM event_publication_policies')).n,14);
  assert.equal((await one(db,"SELECT count(*)::int AS n FROM event_publication_policies p JOIN inventory_sources s ON s.id=p.source_id WHERE s.source_key IN ('barbican-events','unrelated-directory')")).n,0);
  assert.equal((await one(db,"SELECT enabled FROM inventory_sources WHERE source_key='barbican-events'")).enabled,false);
  assert.equal((await one(db,"SELECT metadata ? 'event_auto_publish_verified' AS tagged FROM inventory_sources WHERE source_key='barbican-events'")).tagged,false);
}));
