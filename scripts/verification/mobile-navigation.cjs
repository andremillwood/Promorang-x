// Local production preview only. All external/customer requests are blocked.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5177';
const output = process.env.SCREENSHOT_DIR || '/tmp';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const standalone of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await context.addInitScript(({ standalone }) => {
        localStorage.setItem('promorang_locale', 'en');
        if (standalone) {
          const original = window.matchMedia.bind(window);
          window.matchMedia = query => query === '(display-mode: standalone)' ? Object.defineProperty(original(query), 'matches', { value: true }) : original(query);
        }
      }, { standalone });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === base && !url.pathname.startsWith('/api/')) return route.continue();
        if (url.pathname.includes('fn_global_search')) return route.fulfill({ json: [{ id: 'test-event', title: 'TEST ONLY Music', subtitle: 'Test venue', result_type: 'moment', path: '/moments/test-event', relevance_score: 80 }] });
        return route.fulfill({ json: url.pathname.includes('/moments/feed') ? { data: { moments: [] } } : [] });
      });
      const page = await context.newPage();
      await page.goto(base + '/');
      const nav = page.locator('.public-mobile-navigation');
      await nav.waitFor();
      assert.equal(await page.evaluate(() => matchMedia('(display-mode: standalone)').matches), standalone);
      async function fixed() {
        const box = await nav.boundingBox();
        assert.ok(box && Math.abs(box.y + box.height - 844) < 2, JSON.stringify(box));
        assert.equal(await page.locator('header nav:visible').count(), 0);
        assert.equal(await page.locator('nav[aria-label="Primary navigation"]:visible').count(), 1);
      }
      await fixed();
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, document.body.scrollHeight); });
      await page.waitForFunction(() => Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight) < 2);
      await fixed();
      const footer = await page.locator('footer').boundingBox();
      const navBox = await nav.boundingBox();
      assert.ok(footer.y + footer.height <= navBox.y, 'Footer must clear fixed navigation: ' + JSON.stringify({ footer, navBox }));
      await page.screenshot({ path: `${output}/navigation-${standalone ? 'standalone' : 'browser'}-footer.png` });
      await nav.getByRole('link', { name: 'Offers', exact: true }).tap();
      await page.waitForURL('**/discover?tab=perks');
      await page.waitForFunction(() => document.querySelector('.public-mobile-navigation [aria-current="page"]')?.textContent === 'Offers');
      await page.goBack(); await page.waitForURL(base + '/');
      await page.waitForFunction(() => document.querySelector('.public-mobile-navigation [aria-current="page"]')?.textContent === 'Home');
      await page.goForward(); await page.reload();
      await nav.waitFor();
      await page.waitForFunction(() => document.querySelector('.public-mobile-navigation [aria-current="page"]')?.textContent === 'Offers');
      await page.goto(base + '/shop'); await nav.waitFor();
      await page.waitForFunction(() => document.querySelector('.public-mobile-navigation [aria-current="page"]')?.textContent === 'Shop');
      await page.goto(base + '/');
      const input = page.getByRole('combobox').first(); await input.fill('Music');
      await page.getByRole('listbox').waitFor(); assert.equal(await nav.isVisible(), false);
      await page.keyboard.press('Escape');
      await input.evaluate(el => el.blur());
      await nav.waitFor();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${output}/navigation-${standalone ? 'standalone' : 'browser'}-top.png` });
      const cityMenu = page.locator('header button[aria-haspopup="menu"]:visible').first();
      await cityMenu.tap();
      await page.getByRole('menu').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('menu').waitFor({ state: 'hidden' });
      await page.setViewportSize({ width: 320, height: 844 });
      await fixed();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at 320px');
      await page.goto(base + '/auth');
      await page.getByText('Welcome back', { exact: false }).first().waitFor();
      assert.equal(await nav.count(), 0);
      await context.close();
    }
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await desktop.route('**/*', r => new URL(r.request().url()).origin === base && !new URL(r.request().url()).pathname.startsWith('/api/') ? r.continue() : r.fulfill({ json: [] }));
    await desktop.goto(base + '/');
    await desktop.locator('header').first().waitFor();
    assert.equal(await desktop.locator('.public-mobile-navigation').isVisible(), false);
    assert.equal(await desktop.locator('header nav:visible').count(), 1);
    console.log('PASS: browser and standalone emulation, one mobile menu, fixed footer clearance, direct links, query active state, Back/Forward/reload, search focus/dismiss, menu Escape, 320px viewport, auth, desktop.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
