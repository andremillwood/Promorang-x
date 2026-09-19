# PROMORANG Route Readiness Registry v1

Status: **C1 working ledger**
Source: `apps/web/src/App.tsx`
Parent contract: [Product Completion Contract v1](product-completion-contract-v1.md)
Generated from branch: `design/canonical-object-system-v1`

## Purpose

This registry is the route-level release control for the current convergence programme.

Every route must end in one of these states before release:
- **production** — intentional live surface, audited against canonical design/truth contracts;
- **limited** — intentionally available but secondary/operator/specialist; must not compete with primary IA;
- **hidden** — review/preview/support harness not promoted to users;
- **experimental** — explicit DEV/flag-gated surface;
- **redirect** — legacy deep link preserved only as a redirect;
- **retire** — removed after migration/deep-link plan.

The classifications below are an initial code-derived pass. **Production** means “registered as a live candidate,” not “design-complete.” Each production candidate must still pass C2–C21 as applicable.

## Current registration count

| Status | Count |
| --- | ---: |
| production | 200 |
| redirect | 50 |
| hidden | 14 |
| limited | 25 |
| **Total route entries** | **289** |

This count itself is a release concern. Canonical navigation must expose a much smaller mental model than the registered implementation surface.

## Canonical family checkpoints

### Canonical participant spine
- `/home`
- `/discover`
- `/scenes`
- `/communities`
- `/moments/:id`
- `/card`
- `/vault`
- `/progress`
- `/happened`

### Stakeholder workspaces
- `/dashboard`
- `/organizer`
- `/organizer/events`
- `/stock`
- `/offers`
- `/content-drops`
- `/admin`

### Create
- `/create/moment`
- `/create/campaign`
- `/create/bounty`
- `/propose/new`

### Utility
- `/search`
- `/activity`
- `/notifications`
- `/saved`
- `/profile`
- `/dashboard/settings`
- `/wallet`

### Commerce/value
- `/shop`
- `/storefront/:merchantId`
- `/receipts/:id`
- `/promoshare`
- `/portfolio`
- `/marketplace`
- `/liquidity`

### Public ecosystem
- `/brands`
- `/merchants`
- `/hosts`
- `/venues/:slug`
- `/categories/:categorySlug`
- `/locations/:countrySlug`

## Required C1 decisions

1. Confirm the canonical participant spine and redirect overlapping discovery/live concepts into it.
2. Decide which `/organizer/*` routes remain specialist Host operations versus dashboard aliases.
3. Consolidate standalone Admin utilities into `/admin` where practical.
4. Keep Growth/PromoShare/distribution tools contextual rather than equal top-level destinations.
5. Keep advanced economy routes subordinate to Wallet/Vault.
6. Remove production promotion of preview/review harnesses.
7. Verify old campaign/event deep links survive through redirects where required.
8. Add route readiness guards for incomplete production candidates.
9. Re-run this registry after consolidation and reduce the live route surface.

## Full code-derived registry

| Route | Initial status | Current note |
| --- | --- | --- |
| `/` | production | Primary candidate; still requires experience audit |
| `/welcome` | redirect | Redirects to `/` |
| `/strategies` | production | Primary candidate; still requires experience audit |
| `/strategies/:id` | production | Primary candidate; still requires experience audit |
| `/free/:funnel` | production | Primary candidate; still requires experience audit |
| `/presents` | production | Primary candidate; still requires experience audit |
| `/nightlife` | production | Primary candidate; still requires experience audit |
| `/nightlife/ilhh` | production | Primary candidate; still requires experience audit |
| `/nightlife/encore` | production | Primary candidate; still requires experience audit |
| `/this-week` | production | Primary candidate; still requires experience audit |
| `/access` | production | Primary candidate; still requires experience audit |
| `/crew` | production | Primary candidate; still requires experience audit |
| `/passport` | production | Primary candidate; still requires experience audit |
| `/campaigns/arla-whip-and-cook` | production | Primary candidate; still requires experience audit |
| `/campaigns/arla` | production | Primary candidate; still requires experience audit |
| `/arla` | production | Primary candidate; still requires experience audit |
| `/proposals/arla-pro` | production | Primary candidate; still requires experience audit |
| `/proposals/arla` | production | Primary candidate; still requires experience audit |
| `/proposals/midas` | production | Primary candidate; still requires experience audit |
| `/proposals/midas-entertainment` | production | Primary candidate; still requires experience audit |
| `/midas` | production | Primary candidate; still requires experience audit |
| `/sponsorships/midas` | production | Primary candidate; still requires experience audit |
| `/proposals/midas/sponsors` | production | Primary candidate; still requires experience audit |
| `/brands/midas-summer-2026` | production | Primary candidate; still requires experience audit |
| `/campaigns/midas` | production | Primary candidate; still requires experience audit |
| `/campaigns/midas-summer-weekend` | production | Primary candidate; still requires experience audit |
| `/midas-summer-2026` | production | Primary candidate; still requires experience audit |
| `/hosts/midas` | production | Primary candidate; still requires experience audit |
| `/hosts/midas-entertainment` | production | Primary candidate; still requires experience audit |
| `/dashboard/hosts/midas` | production | Primary candidate; still requires experience audit |
| `/dashboard/host/midas` | production | Primary candidate; still requires experience audit |
| `/campaigns/:campaign` | production | Primary candidate; still requires experience audit |
| `/auth` | production | Primary candidate; still requires experience audit |
| `/auth/callback` | production | Primary candidate; still requires experience audit |
| `/onboarding` | production | Primary candidate; still requires experience audit |
| `/onboarding/brand` | production | Primary candidate; still requires experience audit |
| `/post-login` | production | Primary candidate; still requires experience audit |
| `/join` | production | Primary candidate; still requires experience audit |
| `/for-communities` | production | Primary candidate; still requires experience audit |
| `/for-brands` | production | Primary candidate; still requires experience audit |
| `/solutions` | production | Primary candidate; still requires experience audit |
| `/solutions/:vertical` | production | Primary candidate; still requires experience audit |
| `/for-creators` | production | Primary candidate; still requires experience audit |
| `/for-merchants` | production | Primary candidate; still requires experience audit |
| `/for-agencies` | production | Primary candidate; still requires experience audit |
| `/for-enterprise` | production | Primary candidate; still requires experience audit |
| `/for-causes` | production | Primary candidate; still requires experience audit |
| `/developers` | production | Primary candidate; still requires experience audit |
| `/for-developers` | production | Primary candidate; still requires experience audit |
| `/developers/keys` | production | Primary candidate; still requires experience audit |
| `/developers/console` | production | Primary candidate; still requires experience audit |
| `/how-it-works` | production | Primary candidate; still requires experience audit |
| `/value-studio` | production | Primary candidate; still requires experience audit |
| `/simulator` | production | Primary candidate; still requires experience audit |
| `/sandbox` | production | Primary candidate; still requires experience audit |
| `/what-is-promorang` | production | Primary candidate; still requires experience audit |
| `/about` | production | Primary candidate; still requires experience audit |
| `/learn` | production | Primary candidate; still requires experience audit |
| `/faq` | production | Primary candidate; still requires experience audit |
| `/scenes` | production | Primary candidate; still requires experience audit |
| `/scene/:slug` | production | Primary candidate; still requires experience audit |
| `/action/:slug` | production | Primary candidate; still requires experience audit |
| `/steward/dashboard` | production | Primary candidate; still requires experience audit |
| `/merchant/actions` | production | Primary candidate; still requires experience audit |
| `/referrals/activated` | production | Primary candidate; still requires experience audit |
| `/scenes/:slug` | production | Primary candidate; still requires experience audit |
| `/communities` | redirect | Redirects to `/scenes` |
| `/communities/:slug` | production | Primary candidate; still requires experience audit |
| `/creators` | production | Primary candidate; still requires experience audit |
| `/creators/:handle` | production | Primary candidate; still requires experience audit |
| `/economy` | production | Primary candidate; still requires experience audit |
| `/economy/:concept` | production | Primary candidate; still requires experience audit |
| `/venue-report/:id` | production | Primary candidate; still requires experience audit |
| `/pricing` | production | Primary candidate; still requires experience audit |
| `/nodes` | production | Primary candidate; still requires experience audit |
| `/save-and-win` | production | Primary candidate; still requires experience audit |
| `/membership/checkout` | production | Primary candidate; still requires experience audit |
| `/claim-pages` | production | Primary candidate; still requires experience audit |
| `/billing/result` | production | Primary candidate; still requires experience audit |
| `/help` | production | Primary candidate; still requires experience audit |
| `/support` | production | Primary candidate; still requires experience audit |
| `/terms` | production | Primary candidate; still requires experience audit |
| `/privacy` | production | Primary candidate; still requires experience audit |
| `/account-deletion` | production | Primary candidate; still requires experience audit |
| `/contact` | production | Primary candidate; still requires experience audit |
| `/support/tickets` | production | Primary candidate; still requires experience audit |
| `/support/tickets/:id` | production | Primary candidate; still requires experience audit |
| `/rsvp/:momentId` | production | Primary candidate; still requires experience audit |
| `/guest-pass/:token` | production | Primary candidate; still requires experience audit |
| `/host/moments/:momentId/guests` | production | Primary candidate; still requires experience audit |
| `/join/participant` | redirect | Redirects to `/auth?mode=signup&role=participant&next=/home` |
| `/join/venue` | redirect | Redirects to `/for-merchants` |
| `/hosting` | production | Primary candidate; still requires experience audit |
| `/host` | redirect | Redirects to `/hosting` |
| `/why-join` | redirect | Redirects to `/join` |
| `/propose` | production | Primary candidate; still requires experience audit |
| `/create` | production | Primary candidate; still requires experience audit |
| `/demand` | production | Primary candidate; still requires experience audit |
| `/create/moment` | production | Primary candidate; still requires experience audit |
| `/people` | production | Primary candidate; still requires experience audit |
| `/give` | production | Primary candidate; still requires experience audit |
| `/earn` | production | Primary candidate; still requires experience audit |
| `/happened` | production | Primary candidate; still requires experience audit |
| `/progress` | production | Primary candidate; still requires experience audit |
| `/card` | production | Primary candidate; still requires experience audit |
| `/community/:tab?` | production | Primary candidate; still requires experience audit |
| `/crews` | production | Primary candidate; still requires experience audit |
| `/guilds` | production | Primary candidate; still requires experience audit |
| `/start` | production | Primary candidate; still requires experience audit |
| `/stock` | production | Primary candidate; still requires experience audit |
| `/home` | production | Primary candidate; still requires experience audit |
| `/drop/:slug` | production | Primary candidate; still requires experience audit |
| `/app-preview` | hidden | Preview/review harness; not production UX |
| `/app-preview/people` | hidden | Preview/review harness; not production UX |
| `/app-preview/give` | hidden | Preview/review harness; not production UX |
| `/app-preview/create` | hidden | Preview/review harness; not production UX |
| `/app-preview/demand` | hidden | Preview/review harness; not production UX |
| `/app-preview/create/moment` | hidden | Preview/review harness; not production UX |
| `/app-preview/earn` | hidden | Preview/review harness; not production UX |
| `/app-preview/happened` | hidden | Preview/review harness; not production UX |
| `/app-preview/progress` | hidden | Preview/review harness; not production UX |
| `/app-preview/card` | hidden | Preview/review harness; not production UX |
| `/app-preview/crews` | hidden | Preview/review harness; not production UX |
| `/app-preview/guilds` | hidden | Preview/review harness; not production UX |
| `/app-preview/start` | hidden | Preview/review harness; not production UX |
| `/app-preview/stock` | hidden | Preview/review harness; not production UX |
| `/create/campaign` | production | Primary candidate; still requires experience audit |
| `/create/bounty` | production | Primary candidate; still requires experience audit |
| `/create-moment` | redirect | Redirects to `/create/moment` |
| `/for-you` | limited | Secondary/legacy concept; review against canonical spine |
| `/live` | limited | Secondary/legacy concept; review against canonical spine |
| `/explore` | redirect | Redirects to `/discover` |
| `/discover` | production | Primary candidate; still requires experience audit |
| `/d/:slug` | production | Primary candidate; still requires experience audit |
| `/discoveries/:slug` | production | Primary candidate; still requires experience audit |
| `/discovery/:slug` | production | Primary candidate; still requires experience audit |
| `/discover/moments` | production | Primary candidate; still requires experience audit |
| `/discover/venues` | production | Primary candidate; still requires experience audit |
| `/discover/rewards` | production | Primary candidate; still requires experience audit |
| `/discover/content` | production | Primary candidate; still requires experience audit |
| `/radar` | redirect | Redirects to `/discover/moments` |
| `/opportunity-radar` | redirect | Redirects to `/discover/moments` |
| `/explore/moments` | redirect | Redirects to `/discover/moments` |
| `/explore/venues` | redirect | Redirects to `/discover/venues` |
| `/explore/rewards` | redirect | Redirects to `/discover/rewards` |
| `/rewards` | redirect | Redirects to `/discover/rewards` |
| `/explore/content` | redirect | Redirects to `/discover/content` |
| `/events` | redirect | Redirects to `/discover/moments` |
| `/events/:slug` | production | Primary candidate; still requires experience audit |
| `/momentum` | limited | Secondary/legacy concept; review against canonical spine |
| `/pulse` | limited | Secondary/legacy concept; review against canonical spine |
| `/pulse-feed` | redirect | Redirects to `/live` |
| `/missions` | production | Primary candidate; still requires experience audit |
| `/missions/:id` | production | Primary candidate; still requires experience audit |
| `/watch-unlock` | redirect | Redirects to `/content-drops` |
| `/watch-unlock/:id` | production | Primary candidate; still requires experience audit |
| `/search` | production | Primary candidate; still requires experience audit |
| `/notifications` | production | Primary candidate; still requires experience audit |
| `/brands` | production | Primary candidate; still requires experience audit |
| `/brands/:slug` | production | Primary candidate; still requires experience audit |
| `/merchants` | production | Primary candidate; still requires experience audit |
| `/hosts` | production | Primary candidate; still requires experience audit |
| `/shop` | production | Primary candidate; still requires experience audit |
| `/shop/category/:category` | production | Primary candidate; still requires experience audit |
| `/shop/:listingId` | production | Primary candidate; still requires experience audit |
| `/r/:id` | production | Primary candidate; still requires experience audit |
| `/receipts/value/:id` | production | Primary candidate; still requires experience audit |
| `/receipts/:id` | production | Primary candidate; still requires experience audit |
| `/storefront/:merchantId` | production | Primary candidate; still requires experience audit |
| `/activate` | limited | Secondary/legacy concept; review against canonical spine |
| `/sprint` | production | Primary candidate; still requires experience audit |
| `/seasons/showdown` | production | Primary candidate; still requires experience audit |
| `/merchant/coupons` | production | Primary candidate; still requires experience audit |
| `/merchant/scan` | production | Primary candidate; still requires experience audit |
| `/staff/scanner` | production | Primary candidate; still requires experience audit |
| `/flash-sales` | redirect | Redirects to `/shop` |
| `/categories/:categorySlug` | production | Primary candidate; still requires experience audit |
| `/locations/:countrySlug` | production | Primary candidate; still requires experience audit |
| `/locations/:countrySlug/:citySlug` | production | Primary candidate; still requires experience audit |
| `/city-stewards` | production | Primary candidate; still requires experience audit |
| `/venues/:slug` | production | Primary candidate; still requires experience audit |
| `/scout/enrichment` | production | Primary candidate; still requires experience audit |
| `/scout/events` | production | Primary candidate; still requires experience audit |
| `/aftrhrs` | production | Primary candidate; still requires experience audit |
| `/aftrhrs/ticket/:code` | production | Primary candidate; still requires experience audit |
| `/aftrhrs/pass` | production | Primary candidate; still requires experience audit |
| `/campaigns/aftrhrs` | redirect | Redirects to `/aftrhrs` |
| `/moments/aftrhrs` | production | Primary candidate; still requires experience audit |
| `/moments/aftrhrs/pass` | production | Primary candidate; still requires experience audit |
| `/moments/aftrhrs/ambassador` | production | Primary candidate; still requires experience audit |
| `/moments/aftrhrs/door` | production | Primary candidate; still requires experience audit |
| `/admin/aftrhrs` | redirect | Redirects to `/admin?tab=aftrhrs` |
| `/moments/:id` | production | Primary candidate; still requires experience audit |
| `/moments/:id/record` | production | Primary candidate; still requires experience audit |
| `/moments/:id/edit` | production | Primary candidate; still requires experience audit |
| `/moments/:id/checkin` | production | Primary candidate; still requires experience audit |
| `/bounties` | limited | Secondary/legacy concept; review against canonical spine |
| `/momentsapp` | limited | Secondary/legacy concept; review against canonical spine |
| `/growth` | production | Primary candidate; still requires experience audit |
| `/campaign-intelligence` | production | Primary candidate; still requires experience audit |
| `/pioneers` | production | Primary candidate; still requires experience audit |
| `/growth/pioneer` | limited | Distribution route family; keep contextual rather than primary |
| `/growth/content` | redirect | Redirects to `/content-drops` |
| `/growth/promoshare` | redirect | Redirects to `/promoshare` |
| `/growth/campaigns` | redirect | Redirects to `/promopush` |
| `/growth/referrals` | limited | Distribution route family; keep contextual rather than primary |
| `/growth/pieces` | redirect | Redirects to `/portfolio` |
| `/growth/analytics` | redirect | Redirects to `/dashboard/analytics` |
| `/growth/earnings` | redirect | Redirects to `/wallet` |
| `/organizer` | production | Primary candidate; still requires experience audit |
| `/organizer/events` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/events/new` | redirect | Redirects to `/create/moment` |
| `/organizer/events/:id` | redirect | Redirects to `/dashboard?tab=moments` |
| `/organizer/events/:id/attendees` | redirect | Redirects to `/dashboard/participants` |
| `/organizer/events/:id/check-in` | redirect | Redirects to `/dashboard/activity` |
| `/organizer/events/:id/promote` | redirect | Redirects to `/promopush` |
| `/organizer/events/:id/analytics` | redirect | Redirects to `/dashboard/analytics` |
| `/organizer/communities` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/scenes` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/promoters` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/revenue` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/tickets` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/settings` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/check-ins` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/organizer/analytics` | limited | Operator route family; reconcile with Host/dashboard workspace |
| `/dashboard` | production | Primary candidate; still requires experience audit |
| `/dashboard/participant` | redirect | Redirects to `/dashboard` |
| `/dashboard/creator` | redirect | Redirects to `/dashboard` |
| `/dashboard/host` | redirect | Redirects to `/dashboard` |
| `/dashboard/brand` | redirect | Redirects to `/dashboard` |
| `/dashboard/merchant` | redirect | Redirects to `/dashboard` |
| `/dashboard/agency` | redirect | Redirects to `/dashboard` |
| `/dashboard/moments` | redirect | Redirects to `/dashboard?tab=moments` |
| `/dashboard/participants` | production | Primary candidate; still requires experience audit |
| `/dashboard/campaigns` | redirect | Redirects to `/dashboard?tab=overview` |
| `/dashboard/venues` | redirect | Redirects to `/dashboard?tab=venues` |
| `/dashboard/activity` | production | Primary candidate; still requires experience audit |
| `/dashboard/following` | production | Primary candidate; still requires experience audit |
| `/dashboard/saved` | production | Primary candidate; still requires experience audit |
| `/activity` | production | Primary candidate; still requires experience audit |
| `/saved` | production | Primary candidate; still requires experience audit |
| `/dashboard/settings` | production | Primary candidate; still requires experience audit |
| `/dashboard/rewards` | redirect | Redirects to `/vault` |
| `/wallet` | production | Primary candidate; still requires experience audit |
| `/promoshare` | production | Primary candidate; still requires experience audit |
| `/claim-drop` | production | Primary candidate; still requires experience audit |
| `/content-drops` | production | Primary candidate; still requires experience audit |
| `/content-drops/:id` | production | Primary candidate; still requires experience audit |
| `/offers` | production | Primary candidate; still requires experience audit |
| `/dashboard/offers` | production | Primary candidate; still requires experience audit |
| `/promopush` | production | Primary candidate; still requires experience audit |
| `/promopush/creator` | production | Primary candidate; still requires experience audit |
| `/promopush/info` | production | Primary candidate; still requires experience audit |
| `/promopush/promoter` | production | Primary candidate; still requires experience audit |
| `/careers/:role` | production | Primary candidate; still requires experience audit |
| `/go/:code` | production | Primary candidate; still requires experience audit |
| `/sponsor` | redirect | Redirects to `/dashboard` |
| `/sponsor/analytics` | redirect | Redirects to `/dashboard/analytics` |
| `/featured` | limited | Secondary/legacy concept; review against canonical spine |
| `/vault` | production | Primary candidate; still requires experience audit |
| `/memories/:id` | production | Primary candidate; still requires experience audit |
| `/dashboard/analytics` | production | Primary candidate; still requires experience audit |
| `/dashboard/campaigns/create` | redirect | Redirects to `/create/campaign` |
| `/dashboard/campaigns/:id` | production | Primary candidate; still requires experience audit |
| `/dashboard/bounties/create` | redirect | Redirects to `/create/bounty` |
| `/dashboard/moments/create` | redirect | Redirects to `/create/moment` |
| `/dashboard/venues/add` | production | Primary candidate; still requires experience audit |
| `/dashboard/proposals` | production | Primary candidate; still requires experience audit |
| `/dashboard/proposals/:id` | production | Primary candidate; still requires experience audit |
| `/dashboard/products/add` | production | Primary candidate; still requires experience audit |
| `/dashboard/catalog` | production | Primary candidate; still requires experience audit |
| `/dashboard/brand/campaigns/create` | redirect | Redirects to `/create/campaign` |
| `/dashboard/brand/hosts` | production | Primary candidate; still requires experience audit |
| `/dashboard/gallery` | production | Primary candidate; still requires experience audit |
| `/dashboard/ugc-review` | production | Primary candidate; still requires experience audit |
| `/profile/:userId` | production | Primary candidate; still requires experience audit |
| `/profile` | production | Primary candidate; still requires experience audit |
| `/admin` | production | Primary candidate; still requires experience audit |
| `/admin/promoshare` | limited | Standalone Admin utility; candidate for main Admin consolidation |
| `/admin/featured` | limited | Standalone Admin utility; candidate for main Admin consolidation |
| `/admin/kyc` | redirect | Redirects to `/admin?tab=verification-hub` |
| `/marketplace` | limited | Secondary/legacy concept; review against canonical spine |
| `/portfolio` | limited | Secondary/legacy concept; review against canonical spine |
| `/pieces/:pieceType/:assetId` | production | Primary candidate; still requires experience audit |
| `/pieces/:pieceType/:assetId/manage` | redirect | Redirects to `/portfolio` |
| `/kyc` | production | Primary candidate; still requires experience audit |
| `/liquidity` | limited | Read-only recorded pool/LP/Gems state; production liquidity mutations gated until atomic settlement exists |
| `/propose/new` | production | Primary candidate; still requires experience audit |
| `*` | production | Primary candidate; still requires experience audit |

## Closure rule

C1 is closed only when:
- every row has an intentional final status;
- all `production` rows have an owner and relevant completion-workstream reference;
- all `limited` rows are absent from primary navigation unless contextually required;
- all `hidden` and `experimental` rows are gated;
- all `redirect` rows are tested;
- all `retire` rows are removed only after migration/deep-link review;
- the canonical navigation and mental model are substantially smaller than this implementation registry.
