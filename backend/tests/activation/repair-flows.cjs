// Isolated PostgreSQL execution of the repair SQL. No network or production credentials.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
 let db;
 if (process.env.ACTIVATION_LOCAL_POSTGRES_URL) {
   // Explicit opt-in: a fresh, disposable local database only; never shared staging/production.
   const { Client } = require('pg');
   db = new Client({connectionString:process.env.ACTIVATION_LOCAL_POSTGRES_URL});
   await db.connect();
   db.exec = sql => db.query(sql);
   db.close = () => db.end();
 } else {
   const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
   db = new PGlite();
 }
 const root = path.resolve(__dirname,'../../..');
 const uuid = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
 const [owner,other,staff,manager,admin,participant,org,moment] = [1,2,3,4,5,6,7,8].map(uuid);
 await db.exec(`
 create role anon; create role authenticated; create role service_role;
 create schema auth;
 create table auth.users(id uuid primary key);
 create table public.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,anon;
 create table user_roles(user_id uuid,role text);
 create table organization_members(organization_id uuid,user_id uuid,role text);
 create function can_manage_organization(uuid,text default 'manager') returns boolean language sql security definer as $$select exists(select 1 from organization_members where organization_id=$1 and user_id=auth.uid() and role in ('manager','admin','owner'))$$;
 create table campaigns(id uuid primary key default gen_random_uuid(),brand_id uuid,organization_id uuid,title text,description text,is_active boolean default false,activation_proposal_id uuid,compiler_metadata jsonb default '{}',reward_value text,updated_at timestamptz);
 alter table campaigns enable row level security;
 create policy legacy_read on campaigns for select using (is_active or brand_id=auth.uid() or exists(select 1 from organization_members where organization_id=campaigns.organization_id and user_id=auth.uid()));
 create policy legacy_insert on campaigns for insert with check(brand_id=auth.uid());
 create policy legacy_update on campaigns for update using(brand_id=auth.uid());
 create table moments(id uuid primary key,host_id uuid,organizer_id uuid);
 create table proposals(id uuid primary key default gen_random_uuid(),planner_id uuid,brand_id uuid,title text,description text,budget numeric,funding_goal_gems numeric,status text,lifecycle_state text,metadata jsonb,target_moment_id uuid);
 create function can_manage_activation(uuid) returns boolean language sql security definer as $$select exists(select 1 from proposals where id=$1 and planner_id=auth.uid())$$;
 create table activation_gem_reserves(proposal_id uuid primary key,secured_gems numeric default 0,released_gems numeric default 0,refunded_gems numeric default 0,updated_at timestamptz);
 create table activation_gem_reservations(id uuid primary key default gen_random_uuid(),proposal_id uuid,user_id uuid,amount_gems numeric,purpose text,idempotency_key text unique,status text default 'secured',released_gems numeric default 0,refunded_gems numeric default 0,updated_at timestamptz,access_pass_id uuid);
 create table activation_access_passes(id uuid,status text,cancelled_at timestamptz);
 create table activation_funding_events(proposal_id uuid,payer_user_id uuid,amount numeric,currency text,event_type text,provider text,provider_reference text,verified_by text,metadata jsonb);
 create table wallet(user_id uuid primary key,balance numeric);
 create table ledger(key text primary key,amount numeric);
 create function post_economy_transaction(u uuid,c text,a numeric,k text,e text,i text,entity uuid,t text,n text,m jsonb) returns void language plpgsql security definer as $$begin
 if exists(select 1 from ledger where key=i) then return; end if;
 update wallet set balance=balance+a where user_id=u and balance+a>=0;
 if not found then raise exception 'Insufficient Gem balance'; end if;
 insert into ledger values(i,a); end$$;
 create table promopush_campaigns(id uuid primary key default gen_random_uuid(), title text,linked_moment_id uuid,host_id uuid,brand_id uuid,created_by uuid,geo_radius_meters numeric,geo_center_lat numeric,geo_center_lng numeric,geo_label text,start_time timestamptz,end_time timestamptz,budget numeric,reward_rules jsonb,request_creative_support boolean,objective_type text,push_mode text,reward_type text,package_code text,fulfillment_kit jsonb,distribution_config jsonb,evidence_config jsonb,status text,proposal_id uuid,pricing jsonb default '{}',funding_status text default 'unfunded',launched_at timestamptz,updated_at timestamptz);
 create type public.promopush_channel_type as enum ('qr_code','meta_ads','direct_link','creator_link','street_activation');
 create table promopush_channels(id uuid primary key default gen_random_uuid(),campaign_id uuid,channel_type public.promopush_channel_type,label text,tracking_code text,tracking_link text,moment_entry_endpoint text,reward_per_verified_action numeric);
 create table promopush_creative_tasks(campaign_id uuid,task_type text);
 grant select,insert,update on campaigns to authenticated;
 grant select on organization_members,user_roles to authenticated;
 grant all on promopush_campaigns to authenticated,anon;
 `);
 const original = fs.readFileSync(path.join(root,'supabase/migrations/202607120003_gem_native_activation_economy.sql'),'utf8');
 for(const name of ['secure_activation_gems','refund_activation_gem_reservation']) {
   const start=original.indexOf(`create or replace function public.${name}`);
   await db.exec(original.slice(start,original.indexOf('end $$;',start)+7));
 }
 const growthSchema=fs.readFileSync(path.join(root,'supabase/migrations/202607140003_growth_operating_system.sql'),'utf8');
 await db.exec(growthSchema.slice(0,growthSchema.indexOf('create table if not exists public.growth_identity_links')));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/202608130001_lead_crm.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'supabase/migrations/20261008055945_repair_activation_flows.sql'),'utf8'));
 for(let retry=0;retry<2;retry++) await db.query("insert into growth_events(anonymous_id,event_name,journey,stage,idempotency_key,properties) values('anonymous-fixture','cta_clicked','commercial','captured','business:fixture:completed:recommendation','{\"step\":\"recommendation\",\"navigator_event\":\"completed\"}') on conflict(idempotency_key) do nothing");
 assert.equal((await db.query('select * from growth_events')).rows.length,1);
 const lead=(await db.query("insert into crm_leads(email,stakeholder_type,funnel_key) values('fixture@example.test','merchant','business') returning id")).rows[0];
 await db.query("insert into crm_lead_activities(lead_id,activity_type,title,metadata) values($1,'note','Business route contact requested','{\"contact_consent\":true}')",[lead.id]);
 await assert.rejects(()=>db.query("insert into crm_leads(email,stakeholder_type,funnel_key) values('fixture2@example.test','merchant','unknown')"),/check constraint/);

 await db.query(`insert into user_roles values ($1,'merchant'),($2,'merchant'),($3,'merchant'),($4,'merchant'),($5,'admin')`,[owner,other,staff,manager,admin]);
 await db.query(`insert into organization_members values($1,$2,'staff'),($1,$3,'manager')`,[org,staff,manager]);
 await db.query(`insert into organization_members values($1,$2,'owner')`,[org,owner]);
 await db.query(`insert into moments values($1,$2,$2);`,[moment,owner]);
 await db.query(`insert into wallet values($1,100)`,[owner]);
 const asUser = async (id,fn) => {await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[id||'']); await db.exec('set role authenticated');try{return await fn();}finally{await db.exec('reset role');}};
 const denied = async(fn,pattern) => assert.rejects(fn,pattern);
 const campaign = uuid(20);
 await asUser(owner,()=>db.query(`insert into campaigns(id,brand_id,organization_id,title) values($1,$2,$3,'Plan')`,[campaign,owner,org]));
 for(const id of [owner,staff,manager]) await asUser(id,async()=>assert.equal((await db.query('select * from campaigns where id=$1',[campaign])).rows.length,1));
 for(const id of [other,participant,null]) await asUser(id,async()=>assert.equal((await db.query('select * from campaigns where id=$1',[campaign])).rows.length,0));
 for(const id of [other,staff,participant,null]) await asUser(id,()=>denied(()=>db.query('select open_campaign_activation($1)',[campaign]),/cannot manage|Sign in/));
 await asUser(owner,()=>denied(()=>db.query('update campaigns set brand_id=$1 where id=$2',[other,campaign]),/server managed/));
 await asUser(participant,()=>denied(()=>db.query("insert into campaigns(brand_id,title) values($1,'No')",[participant]),/row-level security/));
 const opened = await asUser(manager,()=>db.query('select open_campaign_activation($1) id',[campaign]));
 const reopened = await asUser(owner,()=>db.query('select open_campaign_activation($1) id',[campaign]));
 assert.equal(opened.rows[0].id,reopened.rows[0].id);
 for(const role of ['brand','agency','admin']) {
  await db.query('update user_roles set role=$1 where user_id=$2',[role,other]);
  await asUser(other,()=>db.query("insert into campaigns(brand_id,title) values($1,'Existing buyer')",[other]));
 }
 await asUser(admin,async()=>assert.equal((await db.query("select get_campaign_workspace_detail($1)->>'id' id",[campaign])).rows[0].id,campaign));
 await db.query('update campaigns set is_active=true where id=$1',[campaign]);
 // Other merchants can see the public campaign but cannot open its management detail.
 await asUser(participant,async()=>assert.equal((await db.query("select get_campaign_workspace_detail($1)->>'id' id",[campaign])).rows[0].id,null));
 await db.query("update user_roles set role='merchant' where user_id=$1",[other]);
 await asUser(other,async()=>assert.equal((await db.query("select get_campaign_workspace_detail($1)->>'id' id",[campaign])).rows[0].id,null));
 await asUser(null,()=>denied(()=>db.query('select get_campaign_workspace_detail($1)',[campaign]),/Sign in/));
 const input={title:'Paid distribution',linked_moment_id:moment,geo_radius_meters:500,geo_center_lat:18,geo_center_lng:-77,start_time:'2099-01-01',end_time:'2099-02-01',objective_type:'foot_traffic',push_mode:'geo',reward_type:'none',fulfillment_kit:{cta:'Visit',landing_url:'/moment'},reward_rules:{},status:'draft'};
 const create=async(key='stable-create')=>(await db.query('select (create_promopush_draft($1,$2,$3,$4)).*',[owner,key,input,'http://localhost'])).rows[0];
 const c=await create();assert.equal(c.id,(await create()).id);
 assert.equal((await db.query('select * from promopush_channels')).rows.length,5);
 await denied(()=>db.query('select create_promopush_draft($1,$2,$3,$4)',[other,'wrong-owner',input,'local']),/own or organize/);
 await denied(()=>db.query('select create_promopush_draft($1,$2,$3,$4)',[owner,'tampered-quote',{...input,pricing:{total_gems:1}},'local']),/server managed/);
 await denied(()=>db.query('select launch_promopush_campaign($1,$2)',[c.id,owner]),/priced activation/);
 const q=uuid(40);
 const quote=async(id,key=q,amount=50)=>db.query('select quote_promopush($1,$2,$3,$4,$5)',[id,amount,'2099-01-01',admin,key]);
 await denied(()=>db.query('select quote_promopush($1,1,$2,$3,$4)',[c.id,'2099-01-01',owner,q]),/permission/);
 await quote(c.id);
 await asUser(other,()=>denied(()=>db.query('select fund_promopush($1,$2)',[c.id,q]),/Not authorized/));
 await asUser(owner,()=>denied(()=>db.query('select fund_promopush($1,$2)',[c.id,uuid(41)]),/Quote changed/));
 await asUser(owner,()=>db.query('select fund_promopush($1,$2)',[c.id,q]));
 await asUser(owner,()=>Promise.all([db.query('select fund_promopush($1,$2)',[c.id,q]),db.query('select fund_promopush($1,$2)',[c.id,q])]));
 assert.equal((await db.query('select * from ledger')).rows.length,1);
 assert.equal(Number((await db.query('select balance from wallet')).rows[0].balance),50);
 await denied(()=>db.query('select launch_promopush_campaign($1,$2)',[c.id,other]),/Not authorized/);
 const live=(await db.query('select (launch_promopush_campaign($1,$2)).*',[c.id,owner])).rows[0];
 assert.equal(live.status,'active');
 assert.equal((await db.query('select (launch_promopush_campaign($1,$2)).*',[c.id,owner])).rows[0].launched_at.getTime(),live.launched_at.getTime());
 const insufficient=await create('insufficient');await quote(insufficient.id,uuid(42),100);
 await asUser(owner,()=>denied(()=>db.query('select fund_promopush($1,$2)',[insufficient.id,uuid(42)]),/Insufficient/));
 await db.query(`update promopush_campaigns set pricing=jsonb_set(pricing,'{expires_at}','"2000-01-01"') where id=$1`,[insufficient.id]);
 await asUser(owner,()=>denied(()=>db.query('select fund_promopush($1,$2)',[insufficient.id,uuid(42)]),/expired/));
 const cancel=await create('cancel-funded');await quote(cancel.id,uuid(43),20);
 await asUser(owner,()=>db.query('select fund_promopush($1,$2)',[cancel.id,uuid(43)]));
 await asUser(owner,()=>db.query('select cancel_promopush($1)',[cancel.id]));
 await asUser(owner,()=>db.query('select cancel_promopush($1)',[cancel.id]));
 assert.equal(Number((await db.query('select balance from wallet')).rows[0].balance),50);
 await denied(()=>db.query('select launch_promopush_campaign($1,$2)',[cancel.id,owner]),/Only a draft/);
 await asUser(owner,()=>denied(()=>db.query("update promopush_campaigns set status='active' where id=$1",[insufficient.id]),/permission denied/));
 const organicInput={...input,push_mode:'organic'};
 const organic=(await db.query('select (create_promopush_draft($1,$2,$3,$4)).*',[owner,'organic-draft',organicInput,'local'])).rows[0];
 assert.equal((await db.query('select (launch_promopush_campaign($1,$2)).*',[organic.id,owner])).rows[0].status,'active');
 // Changed proposal, null ownership and reduced reserve all fail closed.
 const changed=await create('changed-proposal');await quote(changed.id,uuid(44),10);
 await db.query('update proposals set funding_goal_gems=1 where id=(select proposal_id from promopush_campaigns where id=$1)',[changed.id]);
 await asUser(owner,()=>denied(()=>db.query('select fund_promopush($1,$2)',[changed.id,uuid(44)]),/Proposal changed/));
 await denied(()=>db.query('select create_promopush_draft($1,$2,$3,$4)',[owner,'stable-create',{...input,title:'Changed'},'http://localhost']),/different details/);
 await db.query('update promopush_campaigns set host_id=null,brand_id=null where id=$1',[changed.id]);
 await denied(()=>db.query('select launch_promopush_campaign($1,$2)',[changed.id,other]),/Not authorized/);
 await asUser(owner,()=>denied(()=>db.query('select quote_promopush($1,1,$2,$3,$4)',[changed.id,'2099-01-01',admin,uuid(45)]),/permission denied/));
 await db.query('update activation_gem_reserves set refunded_gems=secured_gems where proposal_id=$1',[live.proposal_id]);
 await asUser(owner,()=>denied(()=>db.query('select fund_promopush($1,$2)',[c.id,q]),/Reserve changed/));
 if (process.env.ACTIVATION_LOCAL_POSTGRES_URL) await require('./postgres-races.cjs')({db,owner,admin,input,uuid});
 console.log('PASS: PostgreSQL campaign ownership/membership/roles; atomic draft retry; trusted quotes; tampering; insufficient/expired funding; reserve retries; launch retries; cancellation/refund; organic launch; direct-write denial.');
 await db.close();
})().catch(error=>{console.error(error);process.exit(1);});
