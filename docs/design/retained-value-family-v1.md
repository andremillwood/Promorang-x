# Retained Value Family v1

Status: production-convergence contract

## Thesis

PROMORANG must distinguish **what happened**, **what stayed with the participant**, and **what may become useful later**.

Canonical chain:

`ACTION → VERIFIED CONSEQUENCE → PIECE / ENTITLEMENT / ENTRY → VAULT → USE / DRAW / SHARE → NEW VERIFIED CONSEQUENCE`

The Vault is not a generic wallet and PromoShare is not a generic points balance. Each retained object keeps its own meaning, provenance and advancement rules.

## Canonical object meanings

### Piece / Memory

A Piece is retained cultural or participation history produced by a recorded consequence.

It may carry:
- title
- source Moment / Scene / place
- issued timestamp
- rarity / collection context
- proof reference
- legacy/history score

It does **not** imply:
- cash value
- USD value
- NFT ownership merely because an older client groups memories under an `nft` bucket
- transferable value
- a reward payout

Truth boundary:

`verified history ≠ financial asset`

### Vault

The Vault is the participant's retained-state surface. It may contain different object families, but it must not flatten them into one interchangeable balance.

Current production families include:
- claimed perks / entitlements
- used perks / historical utility
- PromoShare draw entries
- kept proof / memories
- platform Gems and PromoPoints where authoritative profile/card records exist

Truth boundaries:

`claim ≠ redemption`

`entry ≠ win`

`memory ≠ money`

`score ≠ USD value`

`displayed balance ≠ settlement`

### PromoShare entry

A PromoShare ticket/entry is a chance in a named draw or cycle. It is not a reward by itself.

An entry requires an authoritative cycle/entry record. Copying a link, opening WhatsApp/X, or completing a client-only UI action must not mint entries in browser storage.

Truth chain:

`SHARE ROUTE → ATTRIBUTED ACTION → VERIFIED ELIGIBILITY → ENTRY RECORD → DRAW → WINNER RECORD → CLAIM / SETTLEMENT`

Important inequalities:

`share intent ≠ attributed action`

`attributed action ≠ verified eligibility`

`entry ≠ win`

`winner ≠ paid`

### Save & Win

Save & Win is a named-draw mechanic over retained Gems or other explicitly defined principal/value rules.

Current production surface must preserve:

`PARKED PRINCIPAL → ELIGIBLE ENTRY → NAMED DRAW → RESULT → SETTLEMENT`

It must not manufacture:
- prize pools
- personal entries
- personal wins
- balances
- settlement state

## Production convergence completed

### Web Vault

`apps/web/src/pages/Vault.tsx`

- uses authenticated `/api/vault`
- no demo memories are substituted when history is empty
- kept proof is rendered from retained memory records
- claimed perks stay distinct from used perks
- PromoShare entries remain distinct from Gems and PromoPoints

### PromoShare standing

`apps/web/src/hooks/usePromoShareRail.ts`

- PromoShare ticket standing comes from authenticated `/promoshare/dashboard`
- browser `localStorage` is no longer an authoritative ticket source
- compatibility callers may request a refresh after an action, but client code does not mint points, Gems or entries

### PromoShare sharing action

`apps/web/src/components/promoshare/PromoShareAction.tsx`

- sharing creates a route, not a reward
- copy/share destinations do not present default points/tickets
- any configured potential reward is described as conditional on recorded attribution/verification

### Save & Win

`apps/web/src/pages/SaveAndWin.tsx`

- active pools come from the production prize-pool source
- no demo jackpot is substituted
- page explicitly separates principal, entry, win and settlement states

### Vault API

`backend/api/memories.js`

- `legacy_score` remains a retained-history score
- legacy score is no longer projected into `total_value_usd`
- memory assets expose `canonical_type: memory`
- compatibility fields remain for older clients without asserting financial value

## Compatibility debt

Older mobile clients still group memories under an `nft` asset bucket. The backend currently preserves that compatibility field while also exposing `canonical_type: memory`.

This is migration debt, not the canonical product model. A later mobile contract migration should replace the bucket with native retained-object types and remove the deprecated compatibility field.

## Next production work

1. Replace legacy mobile `nft` memory grouping with `memory` / `piece` semantics.
2. Introduce one authoritative issuance ledger for PromoPoints, Gems, entries and retained objects where one does not already exist.
3. Make every reward-bearing action refresh from that ledger instead of assuming a configured policy equals an issued reward.
4. Preserve object-specific histories in Vault rather than flattening all retained state into a single monetary number.
5. Connect Piece reuse/share/collection mechanics only after provenance and ownership semantics are explicit.

## Acceptance test

A participant should be able to answer, for every retained object:

1. **What is this?**
2. **Where did it come from?**
3. **What state is it actually in?**
4. **What can I do with it now?**
5. **What does it explicitly not prove or guarantee?**

If the UI cannot answer those five questions from recorded state, the object is not yet converged.