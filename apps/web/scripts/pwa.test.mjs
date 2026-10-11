import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
function worker(fetch = async () => new Response('network')) {
  const handlers = {}, entries = new Map(), deleted = [], windows = [], opened = [];
  const cache = { addAll: async paths => paths.forEach(p => entries.set(p, new Response(p))), match: async key => entries.get(typeof key === 'string' ? key : key.url), put: async (key, value) => entries.set(key.url, value) };
  const caches = { open: async () => cache, match: cache.match, keys: async () => ['unrelated-cache', 'promorang-pwa-shell-old'], delete: async key => deleted.push(key) };
  vm.runInNewContext(source, { URL, Response, caches, fetch, self: { location: { origin: 'https://promorang.co' }, addEventListener: (name, cb) => handlers[name] = cb, skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => windows, openWindow: async url => opened.push(url) } } });
  const run = async name => { let done; handlers[name]({ waitUntil: p => done = p }); await done; };
  const request = (path, mode = 'navigate') => { let response; handlers.fetch({ request: { url: new URL(path, 'https://promorang.co').href, method: 'GET', mode }, respondWith: p => response = p }); return response; };
  return { handlers, entries, deleted, windows, opened, run, request, cache };
}
test('offline deep links receive the precached recovery page, not missing HTML', async () => {
  const w = worker(async () => { throw new Error('offline'); }); await w.run('install');
  assert.equal(await (await w.request('/es/card?access=private')).text(), '/offline.html');
  assert.equal((await w.request('/assets/missing.js', 'cors')).type, 'error');
});
test('only this app’s old caches are removed', async () => {
  const w = worker(); await w.run('activate'); assert.deepEqual(w.deleted, ['promorang-pwa-shell-old']);
});
test('live data and authenticated HTML never enter the static cache', async () => {
  const w = worker(); assert.equal(w.request('/api/me'), undefined); assert.equal(w.request('https://other.test/assets/a.js', 'cors'), undefined); assert.equal(w.request('/private-data', 'cors'), undefined);
  await w.request('/auth/callback?code=private'); assert.equal(w.entries.size, 0);
});
test('notification links focus an existing absolute URL and reject external destinations', async () => {
  const w = worker(); let focused = false, done;
  w.windows.push({ url: 'https://promorang.co/card', focus: () => { focused = true; } });
  const click = async url => { w.handlers.notificationclick({ notification: { close() {}, data: { url } }, waitUntil: p => done = p }); await done; };
  await click('/card'); assert.equal(focused, true); assert.equal(w.opened.length, 0);
  await click('https://other.test/'); assert.equal(w.opened[0], 'https://promorang.co/today');
});
test('manifest has stable identity, app launch, scope and real icons', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/manifest.webmanifest', import.meta.url)));
  assert.equal(manifest.id, '/'); assert.equal(manifest.scope, '/'); assert.equal(manifest.start_url, '/today?source=pwa');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(new URL('../public' + icon.src, import.meta.url)));
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
});
test('offline copy follows URL locale ahead of saved language, including blocked storage', () => {
  const html = fs.readFileSync(new URL('../public/offline.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [path, saved, expected] of [['/es/card', 'pt-BR', 'es-419'], ['/today', 'pt-BR', 'pt-BR'], ['/pt/card', null, 'pt-BR']]) {
    const elements = Object.fromEntries(['title', 'detail', 'retry'].map(key => [key, { textContent: '', addEventListener() {} }]));
    const document = { cookie: '', documentElement: {}, getElementById: id => elements[id] };
    vm.runInNewContext(script, { document, localStorage: { getItem: () => { if (!saved) throw new Error('blocked'); return saved; } }, navigator: { language: 'en' }, location: { pathname: path }, window: { addEventListener() {} } });
    assert.equal(document.documentElement.lang, expected); assert.ok(elements.title.textContent);
  }
});

test('a cache quota failure does not discard a successful asset response', async () => {
  const w = worker(); w.cache.put = async () => { throw new Error('quota'); };
  assert.equal(await (await w.request('/assets/app.js', 'cors')).text(), 'network');
});
