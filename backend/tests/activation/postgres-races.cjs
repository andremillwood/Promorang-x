// Separate PostgreSQL sessions with deliberately overlapping transactions.
// Uses repair-flows.cjs fixtures, NOT the complete deployed schema or production ledger.
const assert = require('node:assert/strict');
const { Client } = require('pg');
module.exports = async ({db,owner,admin,input,uuid}) => {
  const clients = [0,1].map(() => new Client({connectionString:process.env.ACTIVATION_LOCAL_POSTGRES_URL}));
  const checked = promise => promise.then(value=>({value}), error=>({error}));
  try {
    await Promise.all(clients.map(c=>c.connect()));
    const pids = await Promise.all(clients.map(async c=>(await c.query('select pg_backend_pid() pid')).rows[0].pid));
    assert.notEqual(pids[0],pids[1]);
    for (const c of clients) {
      await c.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
      await c.query("set statement_timeout='5s'");
    }
    // Hold the first transaction open and verify the second actually waits on a DB lock.
    const overlap = async (first,second) => {
      await Promise.all(clients.map(c=>c.query('begin')));
      const a = await first(clients[0]);
      const pending = checked(second(clients[1]));
      let blocked = false;
      for (let attempt=0;attempt<100;attempt++) {
        const row=(await db.query('select wait_event_type from pg_stat_activity where pid=$1',[pids[1]])).rows[0];
        if(row?.wait_event_type==='Lock') {blocked=true;break;}
        await new Promise(resolve=>setTimeout(resolve,10));
      }
      await clients[0].query('commit');
      const b=await pending;
      await clients[1].query(b.error?'rollback':'commit');
      assert.ok(blocked,'Second connection must have waited on a real database lock');
      return [a,b];
    };
    const service = (sql,args) => c=>c.query(sql,args);
    const buyer = (sql,args) => async c=>{await c.query('set local role authenticated');return c.query(sql,args);};
    const create = key => service('select (create_promopush_draft($1,$2,$3,$4)).*',[owner,key,input,'local']);
    const quote = (id,key,amount=10) => service('select quote_promopush($1,$2,$3,$4,$5)',[id,amount,'2099-01-01',admin,key]);
    const fund = (id,key) => buyer('select fund_promopush($1,$2)',[id,key]);
    const launch = id => service('select (launch_promopush_campaign($1,$2)).*',[id,owner]);
    const cancel = id => buyer('select cancel_promopush($1)',[id]);
    const campaign = async id=>(await db.query('select * from promopush_campaigns where id=$1',[id])).rows[0];
    const balance = async ()=>Number((await db.query('select balance from wallet where user_id=$1',[owner])).rows[0].balance);
    const fresh = async (key,q) => {const c=(await create(key)(db)).rows[0];await quote(c.id,q)(db);return c;};
    await db.query('update wallet set balance=1000 where user_id=$1',[owner]);
    const [a,b]=await overlap(create('connection-race-create'),create('connection-race-create'));
    assert.ifError(b.error);assert.equal(a.rows[0].id,b.value.rows[0].id);
    const id=a.rows[0].id;
    assert.equal(Number((await db.query('select count(*) n from promopush_channels where campaign_id=$1',[id])).rows[0].n),5);
    await quote(id,uuid(100))(db);
    const start=await balance();
    const [,funded]=await overlap(fund(id,uuid(100)),fund(id,uuid(100)));
    assert.ifError(funded.error);assert.equal(await balance(),start-10);
    const pid=(await campaign(id)).proposal_id;
    assert.equal(Number((await db.query('select count(*) n from activation_gem_reservations where proposal_id=$1',[pid])).rows[0].n),1);
    const [live,retry]=await overlap(launch(id),launch(id));
    assert.ifError(retry.error);assert.equal(live.rows[0].launched_at.getTime(),retry.value.rows[0].launched_at.getTime());

    const refundable=await fresh('connection-cancel-retry',uuid(101));
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
    await db.query('select fund_promopush($1,$2)',[refundable.id,uuid(101)]);
    const beforeRefund=await balance();
    const [,cancelled]=await overlap(cancel(refundable.id),cancel(refundable.id));
    assert.ifError(cancelled.error);assert.equal(await balance(),beforeRefund+10);
    assert.equal((await campaign(refundable.id)).funding_status,'refunded');

    for(const cancelFirst of [true,false]) {
      const c=await fresh(`connection-launch-cancel-${cancelFirst}`,uuid(cancelFirst?102:103));
      await db.query('select fund_promopush($1,$2)',[c.id,uuid(cancelFirst?102:103)]);
      const before=await balance();
      const [,loser]=await overlap(cancelFirst?cancel(c.id):launch(c.id),cancelFirst?launch(c.id):cancel(c.id));
      assert.match(loser.error?.message||'',/Only a draft/);
      assert.equal((await campaign(c.id)).status,cancelFirst?'paused':'active');
      assert.equal(await balance(),before+(cancelFirst?10:0));
    }
    for(const quoteFirst of [true,false]) {
      const old=uuid(quoteFirst?104:106), next=uuid(quoteFirst?105:107);
      const c=await fresh(`connection-quote-fund-${quoteFirst}`,old);
      const before=await balance();
      const [,loser]=await overlap(quoteFirst?quote(c.id,next,12):fund(c.id,old),quoteFirst?fund(c.id,old):quote(c.id,next,12));
      assert.match(loser.error?.message||'',quoteFirst?/Quote changed/:/Only unfunded/);
      assert.equal(await balance(),before-(quoteFirst?0:10));
      assert.equal((await campaign(c.id)).pricing.quote_id,quoteFirst?next:old);
    }
    console.log('PASS: separate PostgreSQL connections observed lock contention for duplicate creation, funding, launch, refund retries, cancellation vs launch (both orders), quote replacement vs approval (both orders). Fixture wallet only; not full Supabase/Stripe validation.');
  } finally {
    await Promise.all(clients.map(c=>c.end()));
  }
};
