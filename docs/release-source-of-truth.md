# Release source of truth

**Rule:** `main` is the only branch that may become production on Vercel.

This document is the git and deploy contract for Promorang. Agent branches, stacked PRs, and CLI `--prod` deploys have shipped different SHAs to the public site and the API. Consolidation pass executed 6 September 2026.

## What production is

| Surface | Vercel project | Production URL | Git production branch |
| --- | --- | --- | --- |
| Public web | `promorang-alt` | https://promorang.co and https://www.promorang.co | `main` |
| API | `api` | https://api.promorang.co | `main` |

There is no `production` branch and no `promorang-api` project.

Preview deployments from feature branches are allowed. They must never be promoted with `vercel --prod` from a dirty worktree or a non-`main` SHA.

## What is live

| Surface | SHA / source | State |
| --- | --- | --- |
| Web (`promorang-alt`) | `main` at `791bd230a` after #67, #69, #71, and #73 | Git production from `main` is the web line. |
| API (`api`) | `main` at `791bd230a` after the #73 merge | Root Directory is `backend`. Confirm this SHA on `api.promorang.co`, then delete `cursor/creative-cook-shop-season-35a2`. |
| API Git skip | `scripts/vercel-ignore-non-web.mjs` | Still skips a repo-root Vite build if the project id is the API project and Root Directory is wrong. |

## What belongs on `main`

1. The cinematic public homepage on `/` (#58).
2. The people experience at `/app-preview`.
3. Live offer claim/redemption and financial-access containment (#52).
4. Production web build tooling (#54).
5. The PromoCard-centered world spec in `docs/design/promocard-world-experience-v1.md`.
6. Salvaged production bugfixes landed in #63: preview boot without Supabase env, account-menu viewport, signed-in language/theme, real host stats / invite copy.
7. Account identity / home greeting from #61 (`firstGivenName` / `homeGreeting`). No “Member” fallback.
8. #66 discovery / PromoCard UX polish (loading, copy-code, preview nav). Keep its surfaces; do not take back fake spend copy or placeholder serials.
9. Verified PromoCard loop from #60: live inventory, claimed-only credentials, fail-closed ledger reads, no localStorage perks or simulated wallet.
10. Offer fulfillment journeys from #56: QR, automatic, manual, and shipping on the live card. Code / merchant-validation keep the copy-code dialog. Do not restore recharge or preview balances.
11. Discover → PromoCard from #55: named intents, found listings, demand inbox, and server `discovery_card_unlocks`. Unlock perks only when the server returns a `redemption_code`. Do not invent `PR-` codes in the browser or treat localStorage as card credentials.
12. Shared people chrome from #57: Today · People · Create · Earn · Card on web mobile and native. Web `/card` stays the live verified loop. Do not restore recharge, fake balances, `"Member"`, or placeholder serial `PR · 0842`.
13. Kingston After Dark world layer from #62: Consequence Receipt, eligibility-only PromoCard Return (`recharge_amount: 0`), Crews, Scene/Crew context around the live card. Apply `supabase/migrations/202609050003_world_crews_and_kingston_season.sql` before production use. No Game tab and no dollar refill.
14. Value-first PromoCard gateway from #67: lead with live customer value. Do not recut the homepage hero.
15. Interest aim and owned perk from #69: chips aim the card; a claimed perk is On your card / Ready to use / Show this. Persist aim on `promocard_member_aims`.
16. Aimed Discover from #71: card Find {scene} carries `aim`; a live answer can unlock onto the card.
17. Empty-card fill moves from #73: when nothing live can fill the card, prompt Discover, request a perk, start a poll, or host a moment. Do not invent nearby inventory, unbacked credit, or browser `PR-` codes.

`main` must not absorb parallel PromoCard experiments or Today-as-public-home.

## How work reaches production

```text
feature branch  →  PR targeting main  →  preview on Vercel
                                         ↓
                                    review + rebase
                                         ↓
                                      merge to main
                                         ↓
                         Vercel production for web and API
```

1. Every PR targets `main`. No PR-on-PR stacks.
2. Rebase onto current `main` before merge.
3. One product increment per PR. If two open PRs edit PromoCard, homepage, or Discover, merge one and rebase the other.
4. Never run `vercel --prod` from a feature branch or a dirty tree.
5. Production is the `target: production` deployment created from `main`.
6. Database migrations ship before the `main` commit that depends on them.

## Remaining open PRs (keep)

These target `main` and still change production behavior. Merge one overlapping surface at a time.

| PR | Branch | Verdict |
| --- | --- | --- |
| #64 | `cursor/promocard-present-recut-26bd` | Recut of closed #50. Do not merge in parallel with the live card path. |
| #65 | `cursor/promocard-wallet-face-1356` | Parallel wallet 3D pass on `/card`. Do not merge in parallel with the live card path. |

Landed: **#63**, **#61**, **#66**, **#60**, **#56**, **#55**, **#57**, **#62**, then **#67**, **#69**, **#71**, and **#73** (`791bd230a`) on 8 September 2026.

The PromoCard aim / fill stack is on `main`. Do not merge #64 or #65.

## Closed in the 6 September 2026 pass

Closed because they stacked on a non-`main` base, were superseded by #46 / #52 / #53 / #58, or duplicated a keep-open PR. Unique bugfixes were cherry-picked into #63 first.

### Duplicate PromoCard path

| PR | Reason |
| --- | --- |
| #59 | Same trust goal as #60; unique projection/tests should be cherry-picked into #60, not merged in parallel. |

### Salvaged, then closed

| PR | Salvage into #63 |
| --- | --- |
| #51 | Host stats, invite copy, join-bar offset (`e99dd899a`) |
| #42 | Signed-in language/theme (`911b7dbe7`) |
| #6 | Account-menu viewport (`5f39d38d9`) |
| #49 | Preview boot without Supabase (`703d30495` only; not the people-experience rebuild) |

### Stacked on another feature branch

#40 #39 #36 #35 #33 #32 #31 #30 #29 #28 #27 #26 #24 #23 #22 #21 #20 #19 #18 #17 #16 #15 #14 #13 #12 #10 #9

### Targeted `main` but stale / product rewrite

#50 #48 #47 #45 #44 #43 #41 #38 #37 #34 #25 #11 #8 #7

## Archive branches

Deleted after the close pass (zero unique production commits):

- `codex/production-web-snapshot-20260616`
- `promorang-legacy`
- `ui-locked`
- `feat/jamaica-local-drop-share-proof`
- `feature/error-handling-updates`
- `fix/jamaica-discover-missing-imports`
- `fix/jamaica-local-drop-build`
- `fix/promorang-shared-entry`

**Ready to delete after the #73 production alias is confirmed:** `cursor/creative-cook-shop-season-35a2`. Wait for `791bd230a` on the production aliases.

Closed-PR feature branches may be deleted after GitHub closes the PRs.

## Vercel project contract

| Project | Root Directory | Production branch | Build |
| --- | --- | --- | --- |
| `promorang-alt` | repository root (root `vercel.json`) | `main` | `npm run build` → `apps/web/dist` |
| `api` | **`backend` (set in the Vercel dashboard)** | `main` | `backend/vercel.json` / Express |

The `api` Root Directory is now `backend`. `scripts/vercel-ignore-non-web.mjs` remains as a safety net if that setting is cleared.

Do not add a third Vercel project for this repo.
