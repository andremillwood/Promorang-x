# World layer implementation — 5 September 2026

Status: first playable vertical slice, not the full game world.

Canonical spec: [`promocard-world-experience-v1.md`](promocard-world-experience-v1.md).

## What existed before

Already production-wired and reused:

- Verified action spine: `verified_actions` via `performCheckIn` in `backend/api/participation.js`
- Memories / Pieces: `backend/services/memoryService.js` (`issueMemoryForMoment`, `GET /api/vault`)
- PromoCard spend records: `user_promo_cards`
- Attention recharge table: `attention_recharge_events` (schema existed; no Express writer)
- Scenes, `scene_memberships`, `moment_scene_links`
- Kingston After Dark seed: `kingston-after-dark`
- Missions: `content_missions`
- Gems ledger: `gems_transactions`
- PromoShare, referrals, merchant redemptions, pulse
- Signature objects: `PromoCardFace`, `PaperReceipt`, `CollectibleRelic`, `TicketPass`, `NightTrail`
- Today destination: `PeopleHome` via Dashboard
- Real Scene page: `CommunityDetail` at `/scenes/:slug`

Design doctrine only (do not treat as live product):

- `docs/design/promocard-world-experience-v1.md`
- Factions, classes as chosen identities, NPCs, maps-as-requirement
- `seasonService.js` fantasy seasons / XP / loot — **not wired**
- `promoCardService.ts` localStorage demo balances — **not financial truth**
- Existing `/crew` Promorang Crew = referral / invite ladder, not 3–8 person units

## What was reused

- One verified-action model. No `world_events` table.
- Financial truth stays in Gems / PromoCard ledgers.
- `PaperReceipt` → Consequence Receipt
- `CollectibleRelic` → Memories in Vault and after check-in
- `PromoCardFace` stays the economic object; world identity sits around or beneath it
- Experience APIs (`/experience/home`, `/experience/card`)
- Kingston scene row + season copy in metadata

## What was deleted or simplified

- Check-in no longer ends on `CheckInCelebration` particle-burst chrome
- Vault no longer fabricates `demo-m1` / `demo-m2` memories
- Vault no longer leads with a 4-stat KPI grid
- Today no longer shows Kingston current-line copy unless the home API returned it
- Hub people counts stay `memberships.length` (no `activated_members_count`)
- Discover first viewport no longer shows Daily Wheel / streak rail (mock game activity)
- Latest Return only builds from show-up action types, not referrals or purchases

## What was implemented

### Phase 1 — Consequence loop

- Shared resolver: `packages/shared/src/world-layer.ts`
- Server mirror: `backend/services/worldLayer.js`
- Check-in returns a server-trusted consequence receipt
- PromoCard Return records eligibility on `attention_recharge_events` with `recharge_amount: 0`
- Memory reveal uses `CollectibleRelic` only when a memory was actually issued
- Demo moment IDs (`m*`) get a **pending** receipt, never verified delight

### Phase 2 — Today / member home

- Member `PeopleHome` is one current move + PromoCard + latest Return + Crew doorway
- Current move is resolved from a real linked Moment when one exists
- Context lines are only emitted from real membership / Crew / memory facts

### Phase 3 — PromoCard context

- `MyPromoCard` and `DigitalPromoCard` keep spend / eligibility / scan above the fold
- World identity (Scene, Crew, Run, path cue, latest Return, nearest unlock) sits **around** the card
- Card face may carry at most Scene + Crew marks

### Phase 4 — Vault rehierarchy

- Member-first stack: perks → Memories → collection counts from real pieces → tickets → Gems → liquidity
- Advanced backing / reserves remain, demoted behind a disclosure

### Phase 5 — Kingston After Dark slice

- Season copy on `kingston-after-dark` metadata: The City Wakes / Barbican
- Scene page shows season title and line when present
- Discover chips (`Active now`, `Upcoming`, Scene) only on non-editorial Moments with real pulse / start data

### Phase 6 — Crews

- New tables: `world_crews`, `world_crew_members`, `world_runs`
- New surface: `/crews` (not `/crew`)
- Barbican Run progress is derived from crew members’ `verified_actions` + memories
- Size 3–8. One invite code. Temporary Run roles: Captain, Scout, Chronicler, Keeper.

### Phase 7 — Emerging mastery

- Six evidence dimensions from verified action types
- Path title surfaces only after 3 matching actions (“A path is forming”)
- `/progress` shows counts, latest Return, Scene contribution, optional faction

### Phase 8 — Story layer (light)

- Time-aware Kingston headers
- Season headers and dispatch on the Scene
- Signal / Current / Return language only where it does not hide time, place, price, or proof

### Remaining vision (7 September 2026)

- Web Moment detail mounts the existing before/during/after `MomentNow` rail on real UUIDs
- Place pages show truthful chips from the next Moment and PromoCard-accepted offers
- Optional factions (Seekers / Weavers / Makers / Keepers / Stewards) — never required at signup
- Scene health dimensions are counts of the viewer’s verified actions
- Mobile `/crews` and `/progress` stack screens; Today links to world move, Crew, Vault
- Guilds: Scene-scoped federation of 2–6 Crews at `/guilds`. Invite code. Not `/crew` and not a hierarchy.
- Faction war: season board on Progress / Scene. Current versus Static. Mixed-faction Crews stay valid and are treated as stronger.
- Territory: Barbican, Red Hills Road, New Kingston standing (`unknown` / `known` / `held` / `stewarded`) derived from verified presence and support. Not ownership.

## What remains deferred

- Trading, companions, AR, NPC chat, combat, land ownership
- Financial PromoCard refill processor (eligibility is recorded; `available_balance` is **not** auto-incremented)
- Map mode as a V1 requirement
- `system_missions`, `gem_ledger_entries` (schema-only)
- Creative mastery (player-authored Runs)
- Discover wheel/streak removal (held for a dedicated pass)

### Explicit TODOs blocked on operations

- TODO: wire a clearinghouse that applies eligible `attention_recharge_events` to `user_promo_cards.available_balance` after merchant / finance rules exist
- TODO: seed 3–5 **live** Barbican Places / Moments with real hosts before claiming density
- TODO: measure whether first/second verified action, Crew invites, Memory return, and merchant redemptions move

## Data / schema changes

`supabase/migrations/202609050003_world_crews_and_kingston_season.sql`
`supabase/migrations/202609070001_world_roles_and_factions.sql`
`supabase/migrations/202609070002_world_guilds_and_territory.sql`

- `world_crews`, `world_crew_members`, `world_runs`
- Unique: one Crew seat per user
- RLS: authenticated read of own seats; writes stay on the service role
- Kingston scene metadata: `season_key`, `season_title`, `season_line`, `test_area`
- `world_crew_members.run_role` (Captain / Scout / Chronicler / Keeper)
- `world_player_state.faction_key` (optional; never required at signup)
- `world_guilds`, `world_guild_crews` (one Guild seat per Crew)
- Optional `venues.area_key` for Kingston corridor mapping

No second activity ledger. No second wallet.

## UI changes

| Surface | Change |
| --- | --- |
| Today (`PeopleHome`) | One move, PromoCard, Return, Crew doorway |
| Check-in | Consequence Receipt instead of celebration chrome |
| PromoCard | World context beneath / beside the card |
| Vault | Cultural first impression; economy preserved lower |
| `/crews` | Small-group unit + Barbican Run |
| Scene | Season header when metadata exists |
| Discover | Truthful chips on non-editorial Moments |
| `/progress` | Path evidence, Return, Scene contribution, faction contest, territory |
| `/guilds` | 2–6 Crew federation |
| Moment detail | Existing `MomentNow` before/during/after rail on real Moments |
| Place | Signal / PromoCard chips from real next Moment and offers |
| Mobile | `/crews`, `/progress`, Today world move |

## How PromoCard was protected

- No Game tab
- No second wallet, inventory, profile, or economy
- Card face remains holder, available value, eligibility, Places, scan / recharge
- PromoCard Return is eligibility only (`recharge_amount: 0`)
- Path / Crew / Scene never replace spendable value
- `/crew` referral ladder left intact

## Risks

- Backend JS duplicates the shared TypeScript resolver — keep fixtures aligned
- `latestReturn` on Today only reflects show-up actions; other Returns still live in Progress / Vault
- Discover still mixes editorial curated Moments; chips are suppressed on those rows
- Crew Run progress is derived and can look quiet until verified actions exist — that is correct
- Applying the migration is required before `/crews` writes succeed

## How to validate Kingston After Dark

1. Apply `202609050003_world_crews_and_kingston_season.sql`
2. Open `/scenes/kingston-after-dark` — season line should read The City Wakes / Barbican
3. As a member, open Today — one move, no fabricated attendance counts
4. Form a Crew at `/crews`, invite a second person with the code
5. Check in to a **real** linked Moment (not `m*` demo ids)
6. Confirm the receipt lists only server-trusted lines
7. Confirm Vault shows the Memory only if `memories` issued one
8. Confirm PromoCard balance did **not** jump; an `attention_recharge_events` row with `recharge_amount = 0` is enough
9. Confirm `/crew` still shows the invite ladder, not the new Crew

## Success metrics to watch

- PromoCard activation and use
- First verified action; second verified action
- Crew invitations; activated referrals
- Barbican Run objective completion
- Memory holders who return
- Merchant visits / redemptions
- Host turnout; Scene repeat participation

Do not add combat, land deeds, or a Game tab unless these improve.
