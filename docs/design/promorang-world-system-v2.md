# Promorang World System V2

Status: canonical proposal for the cultural strategy layer.  
Authority: `DESIGN.md` remains product law. This document **extends** [`promocard-world-experience-v1.md`](promocard-world-experience-v1.md); it does not replace it.

Implementation notes for the first slice stay in [`world-layer-implementation-2026-09-05.md`](world-layer-implementation-2026-09-05.md). Resolver source of truth: `packages/shared/src/world-system-v2.ts` (backend mirror: `backend/services/worldSystemV2.js`).

## 1. Philosophy

Promorang is the world. The real world is the playfield. The human is the character. PromoCard is the persistent passport.

The world system exists so real contribution becomes identity, belonging, strategy, memory, distribution, and Return. It is not an RPG bolted onto the product.

The loop remains:

`Notice -> Move -> Prove -> Unlock -> Grow -> Return`

V2 names the same loop more precisely:

`Discover -> Throw -> Move -> Prove -> Influence -> Return -> Remember -> Change the World`

Nothing in this layer may create:

- a Game tab
- a second homepage, wallet, currency, or inventory
- generic XP or fake engagement points
- fictional statistics
- monsters, avatars, or aesthetic-only NPCs
- meaningless streaks
- fabricated live activity or territory ownership
- a second verified-action or financial ledger
- localStorage balances as financial truth

Financial truth stays in Gems and PromoCard. World progression comes from server-trusted verified action.

## 2. Evolution from V1 (do not silently overwrite)

V1 proved: one truthful current move, consequence receipts, emerging path, Crews, Guilds, Current vs Static, Kingston territory as standing.

V2 adds **derived cultural strategy** on the same spine (`verified_actions`):

| V1 | V2 |
| --- | --- |
| Optional declared factions (Seekers / Weavers / Makers / Keepers / Stewards) | Four **Houses** derived from Resonance. Declared factions remain readable; they are not required and are not the identity surface. |
| Six path dimensions → Scout / Connector / Creator / Host / Keeper / Patron | **Preserved.** Extra names (Collector, Wayfinder, …) are Titles, not new dimensions. |
| Run roles: Captain, Scout, Chronicler, Keeper | Extended: Captain, Scout, Connector, Amplifier, Keeper. Chronicler remains valid and maps to Amplifier. |
| Throw / Return as copy and receipts | **Return Chains** when attribution is trustworthy |
| Scene contest = Current vs Static | Houses do not replace that war. House vs House is Phase C and stays quiet until evidence exists. |

Do not revive:

- `apps/legacy-web` Four Houses (Sauce / Luna / Tide / Stone)
- `seasonService.js` XP / loot
- `crewService.js` referral “Guild” upline
- `xp_points` profile UI
- `promoCardService.ts` localStorage demo balances
- Discover wheel / streak as world progression

## 3. Four Houses

House answers: **how does this person tend to move the world?**  
Path answers: **what capability have they demonstrated?**

| House | Element | Color (accent only) | Philosophy | Orientation |
| --- | --- | --- | --- | --- |
| Ember | Fire | Red `#C62828` | Ignite | Starting, leading, activating |
| Tide | Water | Blue `#1565C0` | Connect | Gathering, introducing, mobilizing |
| Radiant | Air | Yellow `#F9A825` | Amplify | Discovering, creating, spreading Signals |
| Grove | Earth | Green `#2E7D32` | Sustain | Supporting, returning, strengthening Places |

Examples: Ember + Scout, Tide + Connector, Radiant + Creator, Grove + Host.

Do not force House at signup. Promorang orange remains the action color. House color is a thin identity accent.

## 4. Resonance

Server-derived four-dimensional evidence: fire, water, air, earth.

- Stage 0 — no meaningful evidence
- Stage 1 — “A Resonance is forming” (total ≥ 3)
- Stage 2 — primary affinity visible (total ≥ 6 and a clear leader)
- Stage 3 — House reveal eligible (total ≥ 10, leader ≥ 40% and ahead by 2)

Weights live in `RESONANCE_ACTION_WEIGHTS` (versioned). No Resonance for opens, taps, scrolls, logins, spam, or unverified claims.

Users keep all four scores after reveal. House can change only when another element leads by a wide, stable margin (`HOUSE_SWITCH_LEAD`). No oscillation.

## 5. Paths / classes

Keep the six V1 dimensions. A path title appears only after three matching verified actions.

Additional names in the brief (Collector, Builder, Guide, Amplifier, Merchant Ally, Crew Captain, Archivist, Wayfinder) are **Titles or Run roles**, not a second class tree.

## 6. Traits

Derived, versioned, explainable. Examples: Early Mover, Night Owl, Loyalist, Explorer, Tastemaker, Reliable, Scene Keeper.

No hidden personality profiling. Inactive people are not punished.

## 7. Influence

Non-financial. Answers: how much verified movement did this person / Crew / House / Place / Scene help create?

Not Gems, not money, not PromoCard balance, not a wallet.

One verified action row is counted once. Weights are versioned (`INFLUENCE_ACTION_WEIGHTS`).

## 8. Reputation

Separate from Influence.

- Influence: how much did you move?
- Reputation: how reliably can the network trust you?

Do not reduce Reputation for inactivity. Display only after enough evidence.

## 9. Throws and Return Chains

A Throw is a meaningful outward action with trustworthy attribution — not every tap.

Eligible types include invitation, referral, share, discovery. Downstream hops use `verified_actions.referrer_id` / `contributor_id`.

Surface “Your Throw returned” only when at least one verified downstream movement exists. Never invent revenue.

## 10–26. Later systems (architected, not broadly shipped)

Contracts exist in `world-system-v2.ts` for Techniques, Challenges, Convergences (`scoreConvergence`), Place Influence, Secrets, Rumours, World Events, Relics, Artifacts (`canIssueArtifact`), Titles, House Directives, Alliances, discovery nomination, merchant world-building, and player-authored proposals. Convergence scoring reuses verified Influence and stays quiet with no activity. Artifact issuance is unique by key and reuses Memories/Pieces — no second inventory.

Phase flags:

- `foundation` — always on (resolvers)
- `identity` — safest Progress / PromoCard / Today cues (default on; set `WORLD_SYSTEM_IDENTITY=0` to hide)
- `competition` / `livingWorld` / `distribution` / `endgame` — off until gates pass

Release gates (must move before visual rollout of C–F):

- PromoCard activation and use
- First and second verified action
- Crew form / invite accept
- Run completion
- Merchant visit / redemption
- Repeat participation
- Memory-holder return
- Referral / newcomer activation

No activity = quiet about fabricated density. That is correct. Invitation stays loud: what this is, what to do, and why it pays. Never invent scores, Houses, or live rooms to fill the silence.

## 27. UX rules

Today still answers: what is the most valuable thing I can do right now?  
When identity has not formed, Today and Progress still say why Promorang exists, what to do next, and why that pays the person — Memory, a useful PromoCard, and a Throw that can return.  
PromoCard economic usefulness stays visually dominant. A forming “How you move” line may sit around the card; it never invents a House.  
Progress is where path, Resonance, Influence, and Return Chains live after proof. Until then it is an invitation, not a blank scoreboard.  
Vault remains what you keep.

## 28. Anti-patterns

Do not build a game dashboard. Do not flood four House colors. Do not auto-increment PromoCard `available_balance` from world-only math. Do not duplicate `verified_actions`.

## 29. First-principles challenge (what we refused)

**Unnecessary:** twelve path classes, House vs faction dual pickers, Influence wallet, automatic elemental wins, shipping Convergences before Kingston density exists.

**Duplicates we will not create:** second activity ledger, second inventory, parallel attribution, revival of Sauce/Luna/Tide/Stone or `seasonService` XP.

**Fake engagement we will not ship:** House wars with empty boards, Resonance for login, invented Rumours, fake Place ownership.

**PromoCard protection:** House never replaces spend/eligibility/scan. Influence never appears as a balance. At most one identity line around the card (`Ember · Scout`), never on the plastic face as a third competing mark.

**Operational honesty:** Barbican still needs live Places/Moments. Phase C+ stays flagged until those gates move.
