// Run against a LOCAL Vite server. Every non-local request is blocked or mocked.
const assert = require('node:assert/strict');
(async()=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
 const origin=process.env.LOCAL_WEB_ORIGIN || 'http://127.0.0.1:5174';
 assert.match(origin,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
 const page=await browser.newPage();const events=[];
 await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.includes('/growth-ops/events')) {events.push(route.request().postDataJSON());return route.fulfill({json:{success:true}});}
   if(!url.startsWith(origin+'/')&&!url.startsWith('data:'))return route.abort();
   return route.continue();
 });
 await page.goto(origin+'/business/start');
 await page.getByRole('button',{name:/Bring people in/}).click();
 await page.getByRole('button',{name:/A place people visit/}).click();
 await page.getByRole('button',{name:'Validated visits',exact:true}).click();
 await page.getByPlaceholder('Who should take this action?').fill('Private browser-only notes');
 await page.getByRole('button',{name:/Build my route/}).click();
 await page.waitForURL('**/business/start?resume=1');
 const brief=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('promorang_business_outcome_brief_v1')));
 assert.equal(brief.audience,'Private browser-only notes');
 const signup=page.getByRole('link',{name:'Save and continue',exact:true});
 assert.match(await signup.getAttribute('href'),/role=merchant/);
 await signup.click();await page.waitForURL('**/auth?**');
 await page.goBack();await page.getByRole('link',{name:'Save and continue',exact:true}).waitFor();
 await page.reload();await page.getByRole('link',{name:'Save and continue',exact:true}).waitFor();
 await page.goForward();await page.waitForURL('**/auth?**');
 await page.goto(origin+'/business/start?resume=1');await page.getByRole('link',{name:'Save and continue',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('promorang_business_outcome_brief_v1')).id),brief.id);
 assert.ok(events.some(e=>e.entityType==='business_navigator' && e.properties.navigator_event==='completed'));
 assert.ok(!JSON.stringify(events).includes('Private browser-only notes'));
 const business=events.filter(e=>e.entityType==='business_navigator');
 assert.equal(new Set(business.map(e=>e.idempotencyKey)).size,business.length);
 console.log('PASS browser: merchant signup link, completed brief refresh/direct-link/Back/Forward restoration, commercial step events, event deduplication and private-note exclusion.');
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
