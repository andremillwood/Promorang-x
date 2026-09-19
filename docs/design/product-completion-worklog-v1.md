# PROMORANG Product Completion Worklog v1

Status: **living handoff log**
Last checkpoint: **2026-09-18**
Repository: `andremillwood/Promorang-x`
Branch: `design/canonical-object-system-v1`
PR: **#129 — Canonical Object System v10: convergence + participant loop hardening**
PR state at checkpoint: **open · draft · mergeable · unmerged**
Static head SHA: **intentionally not authoritative — fetch PR #129 before resuming**
Latest CI rule: **validate only meaningful checkpoint heads; do not burn Vercel previews for iterative pushes**

This file exists so work can continue in a new chat without reconstructing the project history.

---

# 1. Read these files first

Authority order:

1. `DESIGN.md` — canonical product/design law.
2. `docs/design/a-plus-platform-execution-plan.md` — execution/release doctrine.
3. `docs/design/product-completion-contract-v1.md` — authoritative remaining-work ledger.
4. `docs/design/production-truth-sweep-v1.md` — release-blocker ledger for synthetic/false production state.
5. `docs/design/route-readiness-registry-v1.md` — C1 route/IA classification ledger.
6. Canonical family contracts:
   - `docs/design/proof-receipt-evidence-family-v1.md`
   - `docs/design/discovery-scene-market-construction-v1.md`
   - `docs/design/retained-value-family-v1.md`
7. Design-expression guidance / Design Lab contracts.
8. Older audits/matrices only as backlog evidence where not superseded.

Do **not** create a new parallel roadmap unless the completion contract explicitly requires it.

---

# 2. Current product thesis

PROMORANG is being completed around:

`CANONICAL TRUTH → CANONICAL OBJECT → DESIGN LAB EXPRESSION → ROLE LENS → JOURNEY COMPOSITION → PRODUCTION UI`

Visual / product grammar:

- WORLD > DASHBOARD
- OBJECTS > CARDS
- ONE MOVE > MANY ACTIONS
- UTILITY IS QUIET
- production absence is meaningful
- no synthetic activity, rewards, attendance, proof, value, history, ROI, queue state, payout, or settlement

Cross-role principle:

> **One object. Many lenses. One history.**

Participant, Creator, Host, Merchant, Brand, Agency and Admin must feel like the same product world while preserving different jobs, density, authority, and controls.

---

# 3. Canonical truth boundaries — do not undo these

Never silently equate:

- proposal = approval
- Discovery = endorsement
- vote = attendance
- demand = supply
- threshold = automatic Moment
- Scene membership = attendance
- Scene = Moment
- RSVP = attendance
- check-in = purchase
- proof submission = verification
- claim = verification
- validation = purchase
- purchase = fulfillment
- approval = settlement
- funded = paid
- attributed action = verified eligibility
- PromoShare entry = win
- selected winner = claimed reward
- claimed reward = settled payout
- configured reward = issued reward
- local/browser state = durable platform history
- reported closeout metric = independently verified telemetry
- source failure = real zero

Production absence stays empty/error/unavailable.

---

# 4. Completion programme status

The completion contract defines C1–C21. Current broad status:

## Actively converged / materially advanced

- **C1 Route readiness / IA** — in progress; route registry exists.
- **C2 Shared shell / spacing / role lenses** — in progress; major role shells and Admin spacing normalized.
- **C3 Participant golden journey** — substantially converged; edge-state/release QA remains.
- **C4 Host** — primary production surfaces are source-backed; deep workflow hardening ongoing.
- **C5 Merchant** — supply, validation, payment and fulfillment boundaries materially hardened.
- **C6 Creator** — proof/value path hardened; acceptance/availability/rights contract remains open.
- **C7 Brand** — in progress; generic role shell cleaned, synthetic creator bureau removed, and legacy analytics now converges on the canonical source-backed Evidence Pack.
- **C8 Agency** — in progress; agency-native result pack and real journey progression added.
- **C9 Admin** — major convergence completed; specialist tabs still need final propagation/QA.
- **C10 Create/Edit** — in progress; Moment, Venue, Inventory and Offer flow truth boundaries hardened.
- **C11 Onboarding** — durable completion and role-first routing hardened.
- **C14 Commerce/Fulfillment** — participant + merchant state boundaries hardened.
- **C15 Wallet/Gems/PromoShare** — user-facing value truth hardened; claim/settlement atomicity remains open.
- **C16 Progress/Result/Return** — operator-closeout provenance and role-scoped return semantics are hardened; journey-closure QA remains.
- **C19 Production Truth Sweep** — **current active workstream**; Discover/Found durable-state, mutation, and fixture truth were hardened in the latest continuation.

## Still requires substantial completion work

- **C12 Profiles / identity / directories**
- **C13 Utility surfaces**
- **C17 Public marketing alignment**
- **C18 Mobile parity**
- **C20 Accessibility / performance / trust**
- **C21 QA / rollout / production release**

---

# 5. Major work completed

## 5.1 Canonical proof/evidence family

Completed direction:

- Merchant scanner uses real redemption/validation.
- Validation ≠ purchase ≠ fulfillment.
- Host proof review uses real pending/history APIs.
- Rejection reasons and audit preserved.
- Creator proof dossier separates release, attribution, earning and settlement.
- Vault uses real `/api/vault`; demo memories removed.
- Admin audit is source-aware.
- Pending proof submission no longer marks attendance.
- Proof approval is the authoritative attendance/reward/memory/return consequence point.
- Repeat proof review is blocked.
- Legacy weaker proof write route fails closed.
- Approval creates People/Today return continuity and PromoCard return eligibility.

Important backend rule:

`/api/participation/moments/:id/complete` creates a **pending proof claim only**.

Attendance/reward/memory/Piece/value consequences occur only through the verified approval path.

---

## 5.2 Discovery + Scene market construction

Completed direction:

- participant Discovery proposals are pending, not self-approved;
- failed proposal writes remain failures;
- public Discovery reads use approved production records;
- no curated/demo fallback on production reads;
- demand questions start from recorded zero state;
- static seeded demand removed from live aggregation;
- Discovery detail no longer fabricates reviews, comments, unlocks or social proof;
- Scene reads/membership are production-backed;
- Scene membership ≠ attendance;
- Scene ≠ Moment;
- demand ≠ supply.

Production Discover curated Moment fallback was later removed again during C19 to prevent regression.

---

## 5.3 Retained value

Completed direction:

- PromoShare browser/localStorage issuance removed as authoritative state;
- share/copy ≠ conversion/reward;
- legacy memory score is not USD;
- mobile Vault normalized old `nft` aliases to memory semantics;
- Save & Win no longer uses demo jackpot/win/settlement;
- Vault/PromoCard/retained-history boundaries documented.

---

## 5.4 Production participant / stakeholder visual convergence

Reference image / Design Lab visual DNA now governs all roles:

- dark immersive world
- restrained orange signal
- stronger editorial hierarchy
- one primary move
- role-specific operating rail
- fewer generic dashboard cards
- consistent authenticated shell

The reference is **visual grammar only**, never source data.

Admin, Host, Merchant, Creator, Brand and Agency should all feel like PROMORANG without sharing identical layouts.

---

# 6. Admin work completed

Admin received substantial product-level convergence:

- canonical Admin page frame / desktop gutters / vertical rhythm;
- simplified primary Admin navigation:
  - Today
  - Moments
  - People
  - Trust
  - Money
- specialist tools moved under **All admin tools**;
- hard-coded Admin queue badges removed;
- Command Center redesigned around intervention/priority;
- Users hierarchy and spacing corrected;
- Moments page simplified around:
  - operational summary
  - source-backed health
  - search/common filters
  - records
- Admin-specific canonical Moment lens added;
- participant join behavior suppressed for Admin;
- Trust replaced fake verification cards with real moderation/proof/KYC/history workspace;
- `/admin/kyc` redirects into canonical Trust;
- ChunkErrorBoundary now distinguishes real chunk failures from normal runtime errors;
- AdminUsers initialization crash fixed.

Do not reintroduce standalone fake Admin dashboards simply because they look polished.

---

# 7. Host work completed

Host dashboard/shell is aligned and primary surfaces are now truth-safe.

Closed problems:

- Host Moments console previously substituted curated Kingston Moments.
- It invented RSVP counts, capacities and rewards.
- Host Sponsorship console used fake brands, escrow totals, earnings and fake Nike opportunity.
- Funded sponsorship copy implied payout.

Current state:

- Hosted Moments use real `useHostedMoments` records only.
- Empty inventory stays empty.
- RSVP/participant records are explicitly not verified attendance.
- Capacity/reward show not-recorded when absent.
- Sponsorship shows authoritative requests only.
- accepted ≠ funded ≠ paid.
- Door/proof workflow remains source-backed.

---

# 8. Merchant work completed

Merchant dashboard/shell is aligned.

Closed synthetic-state problems:

- demo venues removed;
- fake occupancy/rating/capacity/linked Moment counts removed;
- fake storefront/product/price/discount/open-now state removed;
- invalid inventory quantity can no longer become implicit unlimited inventory;
- analytics source failure no longer renders as real zero;
- fulfillment route can no longer bypass payment;
- settlement release remains downstream of verified paid + fulfilled state;
- “Paid revenue” label changed to truthful fulfilled purchase value;
- participant commerce raw-product fallback removed;
- universal fake PromoCard savings badge removed.

Canonical Merchant chain:

`DEMAND → SUPPLY/OFFER → VALIDATION → PURCHASE → FULFILLMENT → RESULT → RETURN`

Do not collapse these states.

---

# 9. Creator work completed / open

Completed:

- Creator dashboard role grammar aligned.
- Proof dossier is source-backed.
- earnings separate pending / approved / settled.
- synthetic creator reputation removed:
  - no fake `98/100` score;
  - no invented culture-tier ladder;
  - recorded creator progress comes from real releases, linked work, attributed joins, verified unlocks;
  - economic tier only appears when stored.
- Content Distribution:
  - client payload can no longer self-assert verification;
  - unconfigured PromoShare entries resolve to zero;
  - UI respects server-awarded zero;
  - no synthetic reward fallback.

Open Creator contract debt:

### Creator acceptance / availability / rights-review

The newer `content_distribution_campaigns` system has campaigns, assets and attributed actions, but does **not** yet expose one canonical record for:

- creator acceptance;
- availability;
- commissioned deliverables;
- rights terms;
- approval/review.

Do not present an open Content Drop as an accepted commission until this contract exists.

This is tracked in the truth ledger.

---

# 10. Brand work completed

Closed:

- Manchester Hills / Pandxtra client-specific logic removed from generic Brand workspace.
- participant wheel/streak/reward utilities removed from Brand.
- Brand creator bureau was found to be entirely synthetic:
  - fake creators;
  - fake stock-photo identities;
  - fake views/likes;
  - fake tiers;
  - fake bounties;
  - fake “32 active creators”;
  - local approve/disburse behavior.
- synthetic bureau replaced by honest bridges to:
  - real Content Drops;
  - real creator profiles;
  - real evidence/result surfaces.

Brand should follow:

`MARKET SIGNAL → SCENE/AUDIENCE FIT → ACTIVATION DECISION → FUND/SUPPLY → EXECUTION → EVIDENCE → OUTCOME → REPEAT/IMPROVE/STOP`

Still needs complete golden-journey QA.

---

# 11. Agency work completed

Completed direction:

- Agency Impact now uses `AgencyManagedResultPack` rather than generic Brand impact UI.
- first-client / first-activation / first-result progression derives from real client/campaign/result state.
- Agency onboarding now remains Agency rather than silently becoming Brand.
- Agency first-value route is client portfolio:
  `/dashboard?view=studio&tab=clients`

Still needs end-to-end client-scoped golden journey QA and export/provenance review.

---

# 12. Create/Edit work completed

## Create Moment

- outcome-first stepped creation already existed;
- RSVP ≠ attendance semantics preserved;
- collaborator insert failure is now reported as partial success;
- creation lands on canonical Moment record.

Open contract debt:

- `moment_collaborators` schema defaults to `confirmed`;
- no canonical invitation/acceptance lifecycle exists yet;
- do not invent acceptance UI until backend contract exists.

## Edit Moment

Fixed:

- old Moments with no proof/conversion contract no longer silently gain `Screenshot` + `check_in`;
- failed selected media upload fails save instead of reporting success.

## Add Venue

- selected image upload failure now fails closed.

## Inventory

- invalid quantity cannot silently become unlimited supply.

## Offer Studio

Previously:
- new offer silently defaulted to `active`;
- silently defaulted to 100 units.

Now:
- new offers save as **draft**;
- quantity starts blank;
- Manage is the explicit activation boundary.

---

# 13. Onboarding work completed

Major consistency fixes:

- durable completion is now “persisted `user_preferences` row exists” for all roles;
- post-login uses the same source;
- Agency no longer maps to Brand;
- Agency first value routes to client portfolio;
- preference persistence failure blocks completion;
- Skip persists a minimal onboarding receipt rather than bypassing durability;
- interrupted-job return remains supported;
- regression test locks Agency landing.

C11 still needs deeper role/capability/interest tailoring and cold-start QA.

---

# 14. Commerce work completed

Participant commerce truth fixes:

- raw `products` fallback no longer synthesizes commerce state;
- unsupported hard-coded PromoCard savings removed;
- explicit sample catalogue remains labelled and non-actionable;
- shared receipt semantics now distinguish:
  - purchase recorded
  - claim recorded
  - reservation recorded
  - redemption recorded
  - fulfilled/completed
  - refunded
  - cancelled/failed

Receipt rule:

> **Recorded ≠ completed. Claim ≠ redemption ≠ purchase. Purchase ≠ fulfillment.**

Shared tests lock these boundaries.

---

# 15. Wallet / Gems / PromoShare work completed / open

Completed:

- Wallet already distinguishes withdrawable and pending balances.
- PromoShare user dashboard no longer returns fake draws when Supabase is unavailable.
- no fallback:
  - 14 entries;
  - 3.5× multiplier;
  - 1,000 Gems jackpot;
  - 5 tickets.
- browser-side PromoShare lottery removed.
- draw modal is now read-only authoritative-state explanation.
- browser cannot locally spend entries, select winner or issue Vault prize.
- Spin Wheel fake browser rewards removed globally.
- Daily Rewards fake local streak rewards removed globally.
- selected result / claim / settlement wording separated.

Open critical debt:

### PromoShare claim/distribution atomicity

Current `promoShareService.claimPrize()` can mark a winner as claimed before some distribution paths complete.

A naïve reorder is unsafe because cash/coupon distribution does not yet have a fully verified idempotent claim transaction.

Required future fix:

`selected → claiming → distributed | pending_settlement | failed/retryable`

with stable idempotency / transactional semantics.

Do not claim this is solved yet.

---

# 16. C16 — Progress / Result / Return

C16's operator-closeout provenance defect is no longer the active blocker.

Closed direction:

- `activation_outcome_snapshots` are explicitly operator-reported closeout snapshots;
- web/mobile writers record the actual supported stakeholder role rather than silently becoming Agency;
- metadata preserves `provenance: "operator_reported"`, recorder role, and `verified_telemetry: false`;
- stakeholder-return aggregation is scoped to the active role;
- participant return excludes operator closeout snapshots;
- Gems/access/openings remain sourced from their own ledgers rather than being relabelled as closeout telemetry;
- mobile Gems movement is not substituted from gross monetary value.

The detailed production-truth finding is T-027 in `production-truth-sweep-v1.md`.

Remaining C16 work is release/golden-journey QA: every stakeholder journey still needs an explicit result destination and meaningful repeat/improve/stop next move.

---

# 16A. CURRENT ACTIVE WORK — C19 Production truth sweep

Latest closed findings:
- **T-032 — Discover and Found could manufacture durable success in the browser.**
- **T-034 — Referral and PromoShare distribution could manufacture attribution and performance.**
- **T-035 — Primary Discover mixed static catalogue state with live market truth.**
- **T-036 — Create Moment trusted static venue and browser/URL demand context.**
- **T-037 — PromoShare still advertised synthetic daily, squad and pre-loaded-card mechanics.**
- **T-038 — Discover promoted chronological inventory as “Featured” and “Trending.”**
- **T-039 — Saved and Activity utilities reported browser-only success / false emptiness.**
- **T-040 — Following collapsed source failures into empty states and exposed non-functional filters.**
- **T-041 — Creator directory mixed fabricated identities, verification and performance proof into production.**
- **T-042 — UserProfile and FollowButton converted source gaps into false identity/social state.**
- **T-043 — Creator share feed published static polls/Moments and invented reward promises.**
- **T-044 — Creator release routes mixed seeded compatibility, false-zero failures and premature publish success.**
- **T-045 — Developer console fabricated live credentials and API execution.**
- **T-046 — Brand analytics and shared media fabricated verification, evidence and performance proof.**

Closed direction:

- a PromoCard unlock is authoritative only when a server-issued redemption code exists;
- local card storage may cache that recorded credential but cannot mint one;
- production city demand/card counts no longer merge browser-only rows;
- production Found listings no longer merge local or seeded fixtures;
- the two synthetic Found database fixtures are removed by forward migration;
- Discovery vote UI waits for the durable mutation before reporting success;
- vote success and PromoCard issuance are separate outcomes;
- Found create/claim stays failed when the durable mutation fails;
- Found claim + promised finder slip is transactional/retry-safe at the SQL boundary;
- referral APIs fail unavailable instead of emitting demo codes/metrics/earnings/validation;
- PromoShare uses only a recorded referral code and otherwise creates an unattributed generic share URL;
- referral source failure is not rendered as zero activity;
- primary Discover questions/places are source-backed rather than merged from static catalogues;
- current-user vote state comes from `discovery_votes`, not persistent browser history;
- Create Moment venue suggestions come from the public venue directory rather than a static verified-venue catalogue;
- a Found → Create Moment handoff is described as recorded demand only after the claimed Found record is re-read from the authoritative source;
- URL/browser context may prefill a draft but cannot establish market truth or bypass authentication.
- production PromoShare now exposes recorded cycles/entries/draws/history without mock streak, squad-slash, saved-perk or pre-loaded-card state;
- unsupported PromoShare gamification/drop components remain development-only rather than production fallbacks.
- Discover chronology is now described as chronology (“Up next”), not unsupported featured/trending status.
- Saved Moments now come from the account ledger; save/remove changes reconcile only after durable writes;
- personalized Activity source failure stays an error, and the feed no longer invents local read receipts.
- Following now fails visibly when its graph/Moment/count sources fail, uses the canonical combined going count, and only exposes filters with real semantics.
- the creator directory is now role/profile-backed only; fabricated creator identities, verification, performance metrics and ranking claims are removed.
- profile identity/social state now distinguishes unavailable/not-found/empty, keeps private histories owner-only, and verifies follow state before mutation.
- creator share inventory now comes from recorded polls, public Moments and live perks; generic sharing no longer carries invented points/ticket promises;
- Content Drop detail/list/account/context/leaderboard routes now fail visibly instead of becoming seeded inventory, empty markets or zero performance;
- content-distribution service/database absence and related-context query failures now propagate as unavailable instead of silently becoming empty records;
- release publication now stages a non-public draft, attaches the real asset, then activates explicitly; partial failure no longer produces a live incomplete opportunity or a premature “launched” claim;
- the retired Creator Missions compatibility surface now delegates to the source-backed release workspace instead of carrying fabricated paid bounties;
- Developer API keys now come from the recorded authenticated key store only; browser-generated “live” secrets, demo revoke success and wildcard mock API-key authentication are removed;
- the public developer playground is explicitly illustrative rather than claiming static payloads are live API execution;
- the legacy Brand analytics route now converges on the canonical source-backed Evidence Pack rather than synthetic verified-action/evidence feeds;
- Brand evidence source failures stay unavailable/unknown instead of becoming zero, and shared Moment/Discovery galleries no longer invent verification or reaction counts.

### NEXT ACTION

Continue C19, but do it in cost-controlled batches:

1. audit/read several related primary-path files before writing;
2. group fixes into one coherent slice;
3. create blobs/tree/commit and move the branch ref once;
4. rely on GitHub CI/static review between slices;
5. keep automatic Vercel Git deployments disabled for this design branch;
6. if visual/browser QA eventually requires a Vercel preview, request explicit approval and deploy only the exact checkpoint SHA;
7. never deploy/promote production without explicit user instruction.

Highest-value remaining sweep targets:

- T-004 production aliases / fixture imports;
- T-005 remaining local/browser authority;
- T-006 hard-coded metrics/social proof;
- T-007 mutation failure semantics;
- deep stakeholder → create/edit → commerce → economy → utilities/profiles/marketing/mobile.

---

# 17. Production truth sweep — important closed findings

The authoritative detailed list is:

`docs/design/production-truth-sweep-v1.md`

Major closed findings include:

- curated production Discover Moments;
- Moment Detail demo/culture fallback;
- fabricated default Moment reward;
- fake Admin Trust cards/metrics;
- hard-coded Admin queue badges;
- Create Moment collaborator partial-write truth;
- Host synthetic sponsorships;
- Merchant demo venues / telemetry;
- Merchant fake storefront/products;
- Creator fake reputation tiers/score;
- Brand fake creator roster/payout state;
- merchant analytics failure rendered as zero;
- payment/fulfillment bypass;
- content-distribution fake reward defaults;
- client verification override;
- Host curated Moments;
- Edit Moment silent proof defaults;
- Venue/media partial writes;
- inventory invalid quantity;
- Offer Studio active/default supply;
- onboarding durable-state mismatch;
- participant commerce fallback;
- unsupported PromoCard savings;
- commerce receipt state collapse;
- PromoShare fake dashboard/draws;
- local spin/streak rewards;
- Discover/Found browser-authority, synthetic Found seeds, optimistic vote success, and finder-slip atomicity.

---

# 18. Open truth/contract debts to remember

Do not lose these during future UI work.

## T-010 — Collaborator acceptance semantics

Moment collaborator schema defaults to confirmed. No true invitation/acceptance lifecycle.

## T-019 — Creator acceptance / availability / rights

No canonical contract in the new content-distribution system yet.

## T-026 — PromoShare claim/distribution atomicity

Selected / claimed / distributed / settled needs a retry-safe transactional contract.

## Earlier follow-up sweep items

Still continue checking:

- production-safe alias reliance;
- local/browser persistence used as authority;
- hard-coded metrics/social proof;
- mutation failure semantics;
- remaining deep stakeholder surfaces;
- utilities/profiles/directories/marketing/mobile.

---

# 19. Route / IA work

`docs/design/route-readiness-registry-v1.md` was generated from `App.tsx`.

Initial extraction found **289 registered route entries**.

This itself is a design/release issue.

Route states:

- production
- limited
- hidden
- experimental
- redirect
- retire

Known consolidation already done:

- `/admin/kyc` → `/admin?tab=verification-hub`

Do not expose all registered routes as equal product concepts.

Canonical navigation should remain much smaller than implementation surface.

---

# 20. CI / release discipline

Current branch:

- `design/canonical-object-system-v1`
- PR #129 remains draft/open/unmerged unless GitHub says otherwise;
- always fetch the actual PR head before making release claims;
- GitHub **Web Build** is the normal iterative validation surface for web changes;
- there is no equivalent full backend/mobile GitHub Actions coverage, so do not overclaim backend/mobile validation.

### Vercel capacity policy

The project is on a constrained Hobby plan. Treat Vercel preview capacity as a release resource, not an edit-time test runner.

For `design/canonical-object-system-v1`:

- root `vercel.json` disables automatic web Git deployments for `design/canonical-object-system-v1`;
- `backend/vercel.json` disables automatic API Git deployments for the same branch;
- branch pushes therefore should not enter either PROMORANG Vercel project’s preview queue;
- batch code changes before moving the branch;
- prefer code review, unit tests, GitHub Actions and contract checks before visual deployment;
- when browser/visual QA genuinely requires a fresh Vercel preview, create one deliberately from the exact checkpoint SHA only after explicit user approval;
- do not run manual Vercel deploy commands for routine validation;
- do not promote or deploy production without explicit user instruction.

This policy does **not** weaken release QA. It moves browser preview validation to deliberate checkpoints instead of every intermediate push.

---

# 21. Working method for the next chat

When the user says **“proceed”**:

1. Fetch PR #129 current head/status.
2. Fetch exact-head workflow run.
3. Read:
   - this worklog,
   - completion contract,
   - production truth sweep.
4. Resume from the **CURRENT ACTIVE WORK / NEXT ACTION** in this log; C19 is current unless later ledger changes supersede it.
5. Audit broadly enough to form one coherent slice before writing.
6. Batch file changes into one Git tree/commit/ref update wherever possible.
7. Fix only concrete blockers discovered.
8. Update the truth/completion ledgers as work closes.
9. Use GitHub CI/static checks for iterative validation.
10. Keep Vercel automatic deployment disabled on the design branch; request explicit approval before any manual preview checkpoint.
11. Do not open new product families or speculative architecture.
12. Do not reintroduce sample/demo state to make production look populated.
13. Do not merge or production-deploy without explicit instruction.

---

# 22. Suggested prompt for a new chat

Use this if continuity is needed:

> Continue work on `andremillwood/Promorang-x`, branch `design/canonical-object-system-v1`, PR #129. Read `DESIGN.md`, `docs/design/product-completion-contract-v1.md`, `docs/design/product-completion-worklog-v1.md`, `docs/design/production-truth-sweep-v1.md`, and `docs/design/route-readiness-registry-v1.md` first. Respect the authority order and do not start a new roadmap. Resume from the worklog’s CURRENT ACTIVE WORK / NEXT ACTION. Verify the exact PR head before changing code. Batch coherent changes into one branch update wherever possible. Keep automatic Vercel deployments disabled for ordinary design-branch iteration; request explicit approval before any manual preview from an exact checkpoint SHA. Continue C1–C21 toward release, preserve canonical truth boundaries, never substitute demo/synthetic production state, and do not merge or production-deploy without explicit instruction.

---

# 23. Definition of done for this programme

Do not call the redesign complete because the major dashboards look good.

Completion requires:

- every route classified;
- every primary surface uses canonical shell/spacing;
- every stakeholder has an end-to-end journey;
- shared objects have deliberate role lenses;
- create/edit flows are understandable and fail truthfully;
- onboarding reaches role-specific first value;
- no synthetic production state on primary paths;
- loading/empty/error/retry/permission states are intentional;
- commerce/value states remain distinct;
- web/mobile semantics agree on primary journeys;
- accessibility/performance/trust gates pass;
- exact release head passes available CI;
- real-record cross-role QA passes;
- rollout/rollback/support docs exist;
- merge/deploy happens only after explicit approval.

