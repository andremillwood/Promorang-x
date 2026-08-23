#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const { values } = parseArgs({ options: { dryRun: { type: 'boolean', default: false } } });
const sourceUrl = 'https://www.visitjamaica.com/experiences/events/events-calendar/';
const checkedAt = new Date().toISOString();
const events = [
  { key:'amalgamation-2026', title:'Amalgamation – The Global Gala', starts:'2026-08-28', ends:'2026-08-30', venue:'Little Theatre', venueSearch:'Little Theatre', city:'Kingston', parish:'Saint Andrew', category:'Dance & Culture', summary:'An international dance showcase presented at the Little Theatre in Kingston.', precision:'date', authoritative:true },
  { key:'jipo-2026', title:'Jamaica International Pickleball Open', starts:'2026-09-11', ends:'2026-09-13', venue:'Pickle & Chill', venueSearch:'Pickle & Chill', city:'Kingston', parish:'Saint Andrew', category:'Sport & Community', summary:'The Caribbean pickleball competition returns with international play, food and music.', precision:'date', authoritative:true },
  { key:'bridal-expo-2026', title:'Jamaica Bridal Expo 2026', starts:'2026-09-13', venue:null, city:'Kingston', parish:'Kingston', category:'Business & Lifestyle', summary:'A wedding and romance industry showcase connecting planners, hotels and service providers.', precision:'date', authoritative:true },
  { key:'japex-2026', title:'JAPEX 2026', starts:'2026-09-14', ends:'2026-09-17', venue:'Moon Palace Jamaica', venueSearch:'Moon Palace Jamaica', city:'Ocho Rios', parish:'Saint Ann', category:'Business & Tourism', summary:'Jamaica’s tourism sales and marketing event at Moon Palace Jamaica.', precision:'date', authoritative:true },
  { key:'treasure-beach-food-rum-reggae-2026', title:'Treasure Beach Food, Rum & Reggae Festival', starts:'2026-11-06', ends:'2026-11-08', venue:null, city:'Treasure Beach', parish:'Saint Elizabeth', category:'Food & Music', summary:'A South Coast festival celebrating Jamaican food, rum, reggae and community.', precision:'date', authoritative:true },
  { key:'annies-revenge-2026', title:'Jamaica Pro Am – Annie’s Revenge', starts:'2026-11-18', ends:'2026-11-22', venue:null, city:'Montego Bay', parish:'Saint James', category:'Golf & Sport', summary:'An international pro-am golf experience in Montego Bay.', precision:'date', authoritative:true },
  { key:'mouttet-mile-2026', title:'Mouttet Mile Invitational', starts:'2026-12-05', venue:'Caymanas Park', venueSearch:'Caymanas Park', city:'Portmore', parish:'Saint Catherine', category:'Sport & Culture', summary:'A major race day combining horse racing, fashion, food and family entertainment.', precision:'date', authoritative:true },
  { key:'reggae-marathon-2026', title:'Reggae Half Marathon 10K & 5K', starts:'2026-12-06', venue:null, city:null, parish:null, category:'Running & Music', summary:'Jamaica’s international distance-running experience with reggae along the course.', precision:'date', authoritative:true, conflict:'Current official tourism material contains inconsistent Kingston and Negril location language.' },
  { key:'fireworks-waterfront-2026', title:'Fireworks on the Waterfront', starts:'2026-12-31', venue:null, city:'Kingston', parish:'Kingston', category:'Family & Culture', summary:'A New Year’s Eve waterfront celebration supporting local businesses and cultural activity.', precision:'date', authoritative:true },
  { key:'jangas-weekly-2026', title:'Janga’s Weekly Live Entertainment', starts:'2026-08-23', venue:'Jangas', venueSearch:'Jangas', city:'Kingston', parish:'Saint Andrew', category:'Live Music & Nightlife', summary:'A candidate recurring series based on the venue’s published description of themed weekly entertainment.', precision:'recurrence_candidate', authoritative:false, source:'https://jangassoundbar.com/', recurrence:true },
];

function normalized(value='') { return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function timestamp(date, end=false) { return date ? `${date}T${end?'23:59:00':'09:00:00'}-05:00` : null; }
function fingerprint(event) { return createHash('sha256').update(`${normalized(event.title)}|${event.starts}|${normalized(event.city||'')}`).digest('hex'); }
async function fetchAll(db, table, columns) { const rows=[]; for(let from=0;;from+=1000){const {data,error}=await db.from(table).select(columns).range(from,from+999);if(error)throw error;rows.push(...data);if(data.length<1000)return rows;} }

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const venues=await fetchAll(db,'pre_populated_venues','id,venue_name,venue_slug,city,state');
const matchVenue=(event)=>event.venueSearch ? venues.find(v=>normalized(v.venue_name)===normalized(event.venueSearch) || normalized(v.venue_name).startsWith(normalized(event.venueSearch))) : null;
const preview=events.map(event=>({event,venue:matchVenue(event)}));
if(values.dryRun){console.log(JSON.stringify(preview.map(x=>({title:x.event.title,venue:x.venue?.venue_name||null,conflict:x.event.conflict||null})),null,2));process.exit(0);}

const {data:source,error:sourceError}=await db.from('inventory_sources').select('id').eq('source_key','visitjamaica-events').single();if(sourceError)throw sourceError;
const {data:batch,error:batchError}=await db.from('inventory_import_batches').insert({source_id:source.id,region:'Jamaica – national event calendar',status:'collecting',query:{source:sourceUrl,checked_at:checkedAt},stats:{candidates:events.length},started_at:checkedAt}).select('id').single();if(batchError)throw batchError;
let published=0,polls=0,missions=0;
for(const {event,venue} of preview){
  const exactVenue=Boolean(venue);
  const confidence=Number(Math.min(1,.65+(event.authoritative?.15:0)+(exactVenue?.12:0)+(event.starts?.08:0)-(event.conflict?.2:0)).toFixed(3));
  const normalizedData={title:event.title,description:event.summary,category:event.category,starts_at:timestamp(event.starts),ends_at:timestamp(event.ends,true),schedule_precision:event.precision,venue_id:venue?.id||null,venue_name:event.venue,venue_slug:venue?.venue_slug||null,venue_match_status:exactVenue?'exact':'unmatched',city:event.city,parish:event.parish,location:[event.venue,event.city,event.parish,'Jamaica'].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', '),conflict:event.conflict||null,recurrence_enabled:false,recurrence_candidate:Boolean(event.recurrence)};
  const candidateRow={batch_id:batch.id,source_id:source.id,entity_type:'moment',source_record_id:event.key,source_url:event.source||sourceUrl,source_last_checked_at:checkedAt,raw_data:{event,matched_venue:venue||null},normalized_data:normalizedData,fingerprint:fingerprint(event),confidence,review_status:confidence>=.85&&exactVenue&&event.authoritative&&!event.conflict&&!event.recurrence?'approved':'needs_research'};
  const {data:candidate,error}=await db.from('inventory_candidates').upsert(candidateRow,{onConflict:'source_id,entity_type,source_record_id'}).select('id,review_status').single();if(error)throw error;
  await db.from('event_candidate_evidence').upsert({inventory_candidate_id:candidate.id,source_url:event.source||sourceUrl,source_name:event.authoritative?'Visit Jamaica':'Venue-owned website',evidence_type:event.authoritative?'official_calendar':'venue_page',observed_facts:normalizedData,is_authoritative:event.authoritative,checked_at:checkedAt},{onConflict:'inventory_candidate_id,source_url'});
  const required=[];
  if(!exactVenue)required.push(['venue','Confirm the event venue','Find the organizer or venue-owned announcement confirming the exact place.',['official announcement','ticket page or current flyer'],30]);
  if(event.precision!=='exact')required.push(['schedule','Confirm the event start time','Submit a current source showing the event date and local start time.',['official schedule or current ticket page'],25]);
  if(event.conflict)required.push(['venue','Resolve the conflicting event location','Provide current organizer evidence resolving the Kingston/Negril conflict.',['organizer announcement or registration page'],35]);
  if(event.recurrence)required.push(['recurrence','Confirm the weekly schedule','Visit or use a venue-owned source to confirm the current weekday and start time.',['venue schedule or recent on-site proof'],30]);
  for(const [type,title,instructions,proof,reward] of new Map(required.map(x=>[x[0],x])).values()){
    await db.from('event_verification_missions').upsert({inventory_candidate_id:candidate.id,mission_type:type,title,instructions,proof_requirements:proof,reward_points:reward},{onConflict:'inventory_candidate_id,mission_type'});missions++;
    const questionType=`event_${type}_verification`;
    const question=type==='venue'?`Where is ${event.title} happening?`:type==='recurrence'?`When does ${event.title} currently recur?`:`What time does ${event.title} begin?`;
    const {data:d,error:dError}=await db.from('discovery_questions').upsert({inventory_candidate_id:candidate.id,question,category:'Event Verification',author_name:'Promorang Event Scout Network',threshold_for_moment:5,question_type:questionType,status:'active',metadata:{event_title:event.title,source_url:event.source||sourceUrl,reward_points:0,conflict:event.conflict||null}},{onConflict:'inventory_candidate_id,question_type'}).select('id').single();if(dError)throw dError;
    const options=type==='venue'?['The listed venue is correct','The venue has changed','It is a multi-venue event','I can verify it in person']:type==='recurrence'?['Weekly schedule is current','The day or time changed','The series is paused','I can verify it in person']:['The listed date is correct; time is unknown','The full schedule is published','The schedule changed','I can verify it in person'];
    const {count}=await db.from('discovery_options').select('id',{count:'exact',head:true}).eq('discovery_id',d.id);if(!count)await db.from('discovery_options').insert(options.map(option_text=>({discovery_id:d.id,question_id:d.id,option_text,votes_count:0})));polls++;
  }
  if(candidateRow.review_status==='approved'){const {error:publishError}=await db.rpc('publish_approved_event_candidate',{p_candidate_id:candidate.id});if(publishError)throw publishError;published++;}
}
await db.from('inventory_import_batches').update({status:'completed',completed_at:new Date().toISOString(),stats:{candidates:events.length,published,polls,missions}}).eq('id',batch.id);
console.log(JSON.stringify({batchId:batch.id,candidates:events.length,published,polls,missions}));
