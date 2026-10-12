# Mobile public navigation repair — 2026-10-11

Base: `5485d7342cc38bc68a957e1008811d5b176f6b44` (includes the newer PWA launch, offline recovery, and icon cache fixes). Draft review only; no merge, production deployment, database change, or customer transaction.

## Reproduced cause and repair

Local production Chromium reproduction showed two competing public menus. `PublicHomeBar` displayed Discover/Shop/Offers/For business on phones, while `PublicMarketHome` rendered Home/Shop/Ask/Events/Card in normal document flow immediately before the footer. The latter was not fixed-position containment failure: its computed position was `static`.

The public layout now owns one fixed mobile navigation bar: Home, Discover, Shop, Offers, For business. These reuse translated public destinations; events and asks remain reachable through discovery and homepage actions. Sign-in/Card, market selection, and language remain in the header. The header navigation row remains on tablet/desktop. The homepage-only bar is removed. Shared ownership prevents legacy page bars from competing with public, participant, or stakeholder layouts.

The layout reserves bottom space through the footer, includes device safe-area insets, and hides the public bar while editing an input so search/keyboard use has room. Query-aware current states distinguish Offers from Discover, including direct links and history navigation. Public scene/venue/creator roots and Live keep the public shell. Auth/onboarding and existing focused landing flows do not acquire a bar. Signed-in participant and stakeholder routes keep their existing navigation and active role; no auth or permissions code changed.

Ordinary browser mode is not treated as installed. No install detection, manifest, service worker, cache, or role persistence logic was changed.

## Verification

From `apps/web`:

- `npm run test -- --pool=threads --maxWorkers=1 --minWorkers=1 src/components/navigation/PublicMobileNavigation.test.tsx src/components/layouts/AppLayout.test.tsx src/components/PWAInstallPrompt.test.tsx src/hooks/useMobileNavigation.test.tsx src/pages/AuthPage.test.tsx src/components/discovery/FindOrAskEntry.test.tsx`: 65 tests passed across scoped runs. Final navigation/layout rerun: 29 passed.
- `node --test scripts/pwa.test.mjs`: 7 passed (offline deep links, cache isolation, manifest, notification URLs, localization, quota handling).
- `npm run lint`: 0 errors, 118 warnings. Changed components also pass the web ESLint configuration.
- `npm run build`: passed. Dynamic SEO data fetch was unavailable; generator still produced 30 localized snapshots and 54 sitemap URLs. Existing chunk-size warning remains.
- `../../node_modules/.bin/tsc --noEmit -p tsconfig.app.json`: 547 existing diagnostics. Independent untouched-main worktree also has 547; diagnostic comparison ignoring line/column offsets has no additions or removals. This is not a clean repository-wide type check.

Against a local production preview on port 5177, from repository root:

```sh
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright node scripts/verification/mobile-navigation.cjs
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright node scripts/verification/mobile-offline.cjs
```

Browser checks cover one visible primary menu, viewport-fixed positioning, footer clearance, query active state, direct links, Back/Forward/reload, search focus/dismiss, city menu Escape, narrow 320px viewport, auth without public navigation, desktop header preservation, and browser versus standalone media-query emulation. External requests are mocked/blocked. The separate offline check uses the real local Chromium service worker and verifies an offline deep link recovers automatically on reconnect without losing its URL.

Signed-in shell/role selection is verified using mocked auth in component tests. Existing drawer focus/Escape and viewport-constrained search behavior are covered by their regression tests; no live customer account was used.

## Limits

Original user screenshots remain inaccessible in this executor: Library preparation succeeded but supported helper downloads failed, including the single permitted retry (`library file transfer failed: download failed`). No further attempt was made. Implementation uses independently reproduced source/runtime defects and locally generated screenshots, not a claim of matching the originals.

Standalone mode and viewport/keyboard behavior are emulated; this is not an actual iPhone/Safari or installed-device test. Physical browser chrome, nonzero device safe-area insets, installation, and on-device keyboard interactions remain manual acceptance checks. No production evidence is claimed.
