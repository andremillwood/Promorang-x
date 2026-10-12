// Run against a local dev/preview server. Playwright is supplied by the QA environment.
// MOBILE_UX_BASE_URL, MOBILE_UX_OUTPUT, PLAYWRIGHT_MODULE and CHROME_EXECUTABLE are optional.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.MOBILE_UX_BASE_URL || 'http://127.0.0.1:4180';
const output = process.env.MOBILE_UX_OUTPUT || '/tmp/promorang-mobile-qa';
const routes = [['home', '/'], ['discover', '/discover'], ['shop', '/shop'], ['offers', '/discover?tab=perks'], ['business', '/solutions'], ['promocard', '/app-preview/card']];
const widths = [320, 360, 375, 390, 414, 430, 768, 1024, 1440];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // No writes to external services during UI checks.
  await page.route('**/*', (route) => {
    const request = route.request();
    if (!['GET', 'HEAD'].includes(request.method())) return route.abort();
    if (request.url().includes('unavailable.supabase.co')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Offline QA"}' });
    return route.continue();
  });
  const rows = [];
  try {
    for (const [name, route] of routes) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base + route);
      await page.locator('h1').first().waitFor();
      await page.waitForTimeout(2500);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 844 });
        const geometry = await page.evaluate(() => {
          const outside = [...document.querySelectorAll('body *')].filter((element) => {
            // SVG artwork can intentionally extend inside a clipped decorative layer.
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height || getComputedStyle(element).position === 'absolute') return false;
            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
              if (['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowX)) return false;
              ancestor = ancestor.parentElement;
            }
            return rect.right > innerWidth + 1 || rect.left < -1;
          }).map((element) => ({ tag: element.tagName, className: element.className }));
          const cards = [...document.querySelectorAll('.pr-plastic-card:not(.pr-card-back)')].map((element) => ({
            width: element.clientWidth, scrollWidth: element.scrollWidth,
            height: element.clientHeight, scrollHeight: element.scrollHeight,
          }));
          return { scrollWidth: document.documentElement.scrollWidth, outside, cards };
        });
        rows.push({ name, width, ...geometry });
        assert.equal(geometry.scrollWidth, width, `${name} page overflow at ${width}`);
        assert.equal(geometry.outside.length, 0, `${name} clipped content at ${width}: ${JSON.stringify(geometry.outside)}`);
        for (const card of geometry.cards) {
          assert.ok(card.scrollWidth <= card.width + 1 && card.scrollHeight <= card.height + 1, `${name} card clipping at ${width}`);
        }
        if ([320, 390].includes(width)) await page.screenshot({ path: path.join(output, `${name}-${width}.png`) });
      }
    }
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(base + '/discover');
    await page.locator('#public-discover-search').fill('zz-no-match-92817');
    const food = page.getByRole('button', { name: 'Food & drink', exact: true });
    await food.click();
    assert.equal(await food.getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    assert.equal(await page.locator('#public-discover-search').inputValue(), '');
    await page.locator('header button').filter({ hasText: 'Kingston', visible: true }).first().click();
    await page.getByRole('searchbox', { name: 'Search country, city or parish...' }).fill('Montego');
    assert.ok(await page.getByRole('menuitem').filter({ hasText: 'Montego' }).count());
    const menu = await page.getByRole('menu').boundingBox();
    assert.ok(menu.x >= 0 && menu.x + menu.width <= 321, 'Location menu fits narrow viewport');
    await page.keyboard.press('Escape');
    await page.locator('header button').filter({ hasText: 'EN', visible: true }).click();
    assert.ok(await page.getByRole('menuitem').count() >= 3);
    await page.keyboard.press('Escape');
    await page.goto(base + '/shop');
    await page.getByRole('searchbox').fill('coffee');
    assert.equal(await page.getByRole('searchbox').inputValue(), 'coffee');
    await page.getByRole('link', { name: 'Services', exact: true }).click();
    assert.ok(page.url().endsWith('/shop/category/services'));
    await page.locator('a[href="/shop/cart"]').first().click();
    assert.ok(/\/shop\/cart|\/auth/.test(page.url()));
    await page.goto(base + '/solutions');
    await page.locator('a[href="/business/start"]').first().click();
    assert.ok(page.url().includes('/business/start'));
    await page.goto(base + '/discover?tab=perks');
    await page.getByRole('heading', { level: 1, name: 'Offers' }).waitFor();
    await page.locator('a[href="/auth?mode=signup&role=participant&next=/card"]').first().click();
    assert.ok(page.url().includes('next=/card'));
    assert.deepEqual(errors, []);
    console.log(`Passed ${rows.length} responsive cases, card geometry and public interactions.`);
  } finally {
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ rows, errors }, null, 2));
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
