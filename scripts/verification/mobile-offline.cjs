// Run against a local production build. No customer API calls are allowed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5177';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === base && !url.pathname.startsWith('/api/') ? route.continue() : route.fulfill({ json: [] });
    });
    const page = await context.newPage();
    await page.goto(base + '/');
    await page.evaluate(async () => {
      await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await context.setOffline(true);
    await page.goto(base + '/discover?tab=perks');
    await page.getByText('You’re offline', { exact: true }).waitFor();
    // The recovery page reloads on the online event; avoid a competing reload.
    await context.setOffline(false);
    await page.locator('.public-mobile-navigation').waitFor();
    assert.ok(page.url().includes('/discover?tab=perks'));
    console.log('PASS: real local Chromium service worker, offline deep link, automatic reconnect/reload recovery.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
