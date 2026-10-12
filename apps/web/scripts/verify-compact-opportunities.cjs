// Read-only browser QA. FEED_FIXTURE must be a captured public /moments/feed response.
// Screenshots use real event data; unit tests separately cover offers and missions.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.MOBILE_UX_BASE_URL || 'http://127.0.0.1:4180';
const output = process.env.MOBILE_UX_OUTPUT || '/tmp/compact-opportunity-qa';
const feed = JSON.parse(fs.readFileSync(process.env.FEED_FIXTURE, 'utf8'));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
  const results = [], errors = [], consoleErrors = [], resourceFailures = [];
  try {
    for (const [width, height] of [[320,568],[360,800],[375,667],[390,844],[430,932],[768,1024],[1440,1000]]) {
      const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, isMobile: width < 768, timezoneId: 'America/Jamaica', reducedMotion: 'reduce' });
      page.on('requestfailed', request => resourceFailures.push({ url:request.url().split('?')[0], error:request.failure()?.errorText }));
      page.on('response', response => { if(response.status() >= 400) resourceFailures.push({ url:response.url().split('?')[0], status:response.status() }); });
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      await page.route('**/*', route => {
        const request = route.request();
        if (request.url().includes('/moments/feed')) return route.fulfill({ json: feed });
        if (!['GET','HEAD','OPTIONS'].includes(request.method())) return route.abort();
        return route.continue();
      });
      await page.goto(base);
      const card = page.locator('.home-discovery-card');
      await card.waitFor();
      await page.evaluate(() => document.fonts.ready);
      await card.locator('img').evaluate(img => img.decode());
      await page.screenshot({ path: path.join(output, `${width}.png`) });
      const facts = await card.evaluate(el => {
        const box = e => { const r = e.getBoundingClientRect(); return { top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
        const image = el.querySelector('img'), media = el.querySelector('.home-discovery-media'), cta = el.querySelector('a'), description = el.querySelector('.home-discovery-description');
        return { card:box(el), media:box(media), image:box(image), fit:getComputedStyle(image).objectFit, natural:[image.naturalWidth,image.naturalHeight], title:box(el.querySelector('h2')), action:box(cta), ctaClipped:cta.scrollWidth>cta.clientWidth || cta.scrollHeight>cta.clientHeight, links:el.querySelectorAll('a').length, descriptionHeight:description?.getBoundingClientRect().height, lineHeight:description ? parseFloat(getComputedStyle(description).lineHeight) : null, pageOverflow:document.documentElement.scrollWidth>innerWidth, date:el.querySelector('time')?.dateTime, href:cta.getAttribute('href') };
      });
      assert.equal(facts.pageOverflow, false); assert.equal(facts.ctaClipped, false); assert.equal(facts.links, 1);
      assert.equal(facts.fit, 'contain'); assert(facts.natural[0]>0); assert(facts.media.bottom <= facts.title.top);
      assert(Math.abs(facts.media.width / facts.media.height - 2) < .02);
      assert(facts.descriptionHeight <= facts.lineHeight * 2 + 1);
      const heading = () => card.locator('h2').innerText();
      const first = await heading();
      await page.getByRole('button', { name:'Next opportunity', exact:true }).click();
      assert.notEqual(await heading(), first);
      await page.getByRole('button', { name:'Previous opportunity', exact:true }).click();
      assert.equal(await heading(), first);
      const carousel = page.locator('.home-opportunity-carousel');
      await carousel.focus(); await page.keyboard.press('ArrowRight'); assert.notEqual(await heading(), first);
      await page.keyboard.press('ArrowLeft'); assert.equal(await heading(), first);
      // Native Chromium touch events exercise the browser's pointer/scroll arbitration.
      const session = await page.context().newCDPSession(page);
      await card.scrollIntoViewIfNeeded();
      const media = await card.locator('.home-discovery-media').boundingBox();
      const y = media.y + media.height / 2;
      await session.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x:media.x+media.width*.8,y}] });
      for (const fraction of [.65,.5,.35,.2]) await session.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x:media.x+media.width*fraction,y}] });
      await session.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
      await page.waitForFunction(title => document.querySelector('.home-discovery-card h2').textContent !== title, first);
      assert.equal(await page.getByRole('button', {name:'Events',exact:true}).getAttribute('aria-pressed'), 'true');
      const afterSwipe = await heading();
      await card.locator('a').focus(); await page.keyboard.press('ArrowRight'); assert.equal(await heading(), afterSwipe);
      // Stress long identity fields without inventing production inventory.
      await card.evaluate(el => {
        el.querySelector('h2').textContent = 'LongUnbrokenEventName'.repeat(12);
        el.querySelector('.home-discovery-meta span').textContent = 'Long venue address '.repeat(15);
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await card.locator('a').evaluate(el => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight), false);
      await card.locator('a').scrollIntoViewIfNeeded();
      const action = await card.locator('a').boundingBox();
      const beforeLinkGesture = page.url();
      await session.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x:action.x+action.width*.8,y:action.y+action.height/2}] });
      for (const fraction of [.65,.5,.35,.2]) await session.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x:action.x+action.width*fraction,y:action.y+action.height/2}] });
      await session.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
      assert.equal(page.url(), beforeLinkGesture, 'Swipe on a CTA must not accidentally open it');
      assert.equal(await heading(), 'LongUnbrokenEventName'.repeat(12), 'Link gestures must not advance the carousel');
      const href = await card.locator('a').getAttribute('href');
      await card.locator('a').click(); await page.waitForURL(url => url.pathname === href);
      assert.equal(new URL(page.url()).pathname, href);
      results.push({ width, height, ...facts, controls:true, keyboard:true, touchSwipe:true, detailLink:true });
      await page.close();
    }
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors, consoleErrors:[...new Set(consoleErrors)], resourceFailures }, null, 2));
    await browser.close();
  }
  console.log(`Passed ${results.length} widths: artwork containment, card geometry, CTA, buttons, keyboard, native touch swipe and event routes.`);
})().catch(error => { console.error(error); process.exitCode=1; });
