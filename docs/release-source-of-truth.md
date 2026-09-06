# Release source of truth

**Rule:** `main` is the only branch that may become production on Vercel.

This document is the git and deploy contract for Promorang. It exists because agent branches, stacked PRs, and CLI `--prod` deploys have been shipping different SHAs to the public site and the API.

## What production is

| Surface | Vercel project | Production URL | Git production branch |
| --- | --- | --- | --- |
| Public web | `promorang-alt` | https://promorang.co and https://www.promorang.co | `main` |
| API | `api` | https://api.promorang.co | `main` (intended) |

There is no `production` branch and no `promorang-api` project. Older deploy notes that name those are stale.

Preview deployments from feature branches are allowed. They must never be promoted with `vercel --prod` from a dirty worktree or a non-`main` SHA.

## What is live right now

Snapshot taken 6 September 2026 against the linked Vercel team and `origin/main`.

| Surface | Live SHA | Source | State |
| --- | --- | --- | --- |
| Web (`promorang-alt`) | `b068682` — `docs: define PromoCard-centered world experience v1` | Git push to `main` | READY. Matches `origin/main`. |
| API (`api`) | `ff0c98d` on `cursor/creative-cook-shop-season-35a2` | Dirty CLI `--prod` | READY, but **not `main`**. |
| API Git `main` | `b068682` | Git production hook | ERROR. The `api` project is building the Vite web app from the repo root (`Cannot find package 'vite'`). |

So the public site is on current `main`. The API people actually hit is an older feature-branch deploy. Until the `api` project Root Directory is `backend` and that project only builds from `main`, git consolidation on the web side will not make the API match.

## What belongs on `main`

`main` should contain only the product that is already true, or that has been reviewed as the next production increment:

1. The cinematic public homepage on `/` (restored by #58).
2. The people experience at `/app-preview` (Today, Discover, Create, Earn, Card).
3. Live offer claim/redemption and financial-access containment from #52.
4. Production web build tooling from #54.
5. The PromoCard-centered world spec in `docs/design/promocard-world-experience-v1.md`.

`main` should **not** absorb:

- Stacked agent PRs that target other feature branches.
- Parallel PromoCard / homepage / Discover experiments that rewrite the same surfaces.
- A second public home that replaces `/` with Today. That was tried from `cursor/creative-cook-shop-season-35a2` and then reverted by #58.
- Archive branches with zero unique commits (`promorang-legacy`, `ui-locked`, Jamaica fix branches, `codex/production-web-snapshot-20260616`).

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

Hard rules:

1. Every PR targets `main`. No PR-on-PR stacks.
2. Rebase onto current `main` before merge. Do not merge a branch that is more than a few commits behind without rebasing.
3. One product increment per PR. If two open PRs edit PromoCard, homepage, or Discover, merge one and rebase the other.
4. Never run `vercel --prod` from a feature branch or a dirty tree. Use GitHub merge to `main`.
5. Do not treat a green preview as production. Production is the `target: production` deployment created from `main`.
6. Database migrations in `supabase/migrations` ship before the `main` commit that depends on them.

## Open PR triage

Triage as of 6 September 2026. Counts are `ahead` / `behind` `origin/main`.

### Keep open — current candidates on `main`

These are the only PRs that should be considered for the next production increment. Merge at most one overlapping surface at a time, then rebase the rest.

| PR | Branch | Ahead / behind | Note |
| --- | --- | --- | --- |
| #62 | `cursor/world-layer-kingston-a62d` | 2 / 0 | Kingston After Dark world layer. Newest, already on current `main`. |
| #61 | `cursor/home-greeting-experience-bc77` | 3 / 1 | Home greeting / identity. Rebase once, then review. |
| #60 | `cursor/promocard-verified-loop-8bcd` | 3 / 6 | Live inventory loop. Overlaps #59. Pick one PromoCard truth PR. |
| #59 | `codex/promocard-trust-and-activation` | 1 / 6 | Removes simulated payment/recharge. Overlaps #60. |
| #57 | `cursor/mobile-web-parity-65dc` | 6 / 6 | Shared chrome. Rebase after the homepage/card decision. |
| #56 | `cursor/offer-fulfillment-journeys-25fd` | 2 / 6 | Redemption journeys. Keep if still unique after #52. |
| #55 | `cursor/discovery-demand-inbox-9e47` | 7 / 6 | Discover → PromoCard. Rebase after #53, which already landed the interest-first path. |

### Rebase or close — targeting `main` but stale

These still point at `main` but predate #46 / #52 / #53 / #58. Do not merge as-is. Cherry-pick only a still-true fix.

| PR | Why it is stale |
| --- | --- |
| #51, #50, #49, #48, #47 | 16 commits behind. People-language / empty-state work likely superseded by #46 and #52. |
| #45, #44, #43, #42 | 23 commits behind. Homepage nav and first-run work overlapped by #58. |
| #41, #7 | Broad i18n. Keep only if still needed after a rebase onto current homepage copy. |
| #38, #37, #34, #28 | `/promocard` and shop-partner work. `main` still has `/card` and `/app-preview/card`, not `/promocard`. If the public route is still wanted, cut a fresh PR from current `main`. |
| #25 | Ghost PromoShare links. Re-check against current moment routes before merge. |
| #11, #8, #6 | Old wallet / agent / viewport fixes. Re-open from `main` only if the bug still exists. |

### Close — stacked on other feature branches

These cannot merge cleanly into production because their base is not `main`. The useful idea, if any, has to be re-cut from current `main`.

#40, #39, #36, #35, #33, #32, #31, #30, #29, #27, #26, #24, #23, #22, #21, #20, #19, #18, #17, #16, #15, #14, #13, #12, #10, #9

Most of this stack was an August experiment around Today-as-home, Discover-as-poll-bag, and PromoCard credit loops. Later `main` merges already took the surviving pieces: people chrome (#46), platform cleanup (#52), Discover-as-path (#53), cinematic home (#58).

## Archive branches

Safe to delete after this contract is accepted. None are ahead of `main` with production-unique work:

- `codex/production-web-snapshot-20260616`
- `promorang-legacy`
- `ui-locked`
- `feat/jamaica-local-drop-share-proof`
- `feature/error-handling-updates`
- `fix/jamaica-discover-missing-imports`
- `fix/jamaica-local-drop-build`
- `fix/promorang-shared-entry`
- `cursor/creative-cook-shop-season-35a2` — do not promote again. It is the SHA currently stuck on the API production alias.

`fix/mobile-account-menu-viewport` and `fix/mobile-account-menu-viewport-clean` have one commit ahead and belong with PR #6: verify, then close or re-cut.

## Vercel project contract

Both GitHub-linked projects watch `andremillwood/Promorang-x`. Every push therefore creates a web preview and an API preview.

Required dashboard settings:

| Project | Root Directory | Production branch | Build |
| --- | --- | --- | --- |
| `promorang-alt` | repository root (uses root `vercel.json`) | `main` | `npm run build` → `apps/web/dist` |
| `api` | `backend` | `main` | backend `vercel.json` / Express |

Until `api` uses Root Directory `backend`, Git production deploys of `main` will keep failing and `api.promorang.co` will stay on the last successful CLI deploy.

Do not add a third Vercel project for this repo.

## Next consolidation moves

Do these in order. Do not merge the stale stack “to clean git.”

1. Set the `api` Vercel Root Directory to `backend` and confirm a `main` production deploy succeeds.
2. Confirm `api.promorang.co` points at a `main` SHA, not `ff0c98d`.
3. Merge at most one of #59 / #60 after rebase, or close the loser.
4. Review #62 against the world spec already on `main`. Merge only if the implementation matches that spec.
5. Rebase #61, #57, #56, #55 onto the result. Close any that no longer change production behavior.
6. Close the stacked PRs listed above.
7. Delete the archive branches.

Closing and deleting is intentional and should be done in a dedicated pass after this contract is accepted, so unique fixes are not lost inside a stack.
