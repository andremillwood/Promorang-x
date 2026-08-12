# Guidance Disclosure System

Last updated: 2026-07-28

## Purpose

Promorang uses guided explanations in complex areas like creation, proof, rewards, pieces, and dashboards. Those explanations are useful on first contact, but they should not permanently crowd repeat-use workspaces.

Use `GuidanceDisclosure` when a page needs reusable context that should be available on demand and can collapse after the user has seen it.

## Density Modes

Users can choose guidance density in Settings under Privacy & account.

- `guided`: guides open the first time a user sees a feature, then remain collapsed after closing.
- `compact`: guides start collapsed while still showing the summary.
- `minimal`: guides start collapsed and hide summary copy behind a small Guide control.

Logged-in users also get per-guide progress in `user_guidance_progress`. Guests use local storage.

## When To Use

Use `GuidanceDisclosure` for:

- Step-level workflow explanation.
- Risk, value, or proof context users may need before acting.
- Dashboard interpretation panels that help first-time users understand the surface.
- Repeatable “how this works” panels.

Use an inline tooltip for:

- One-field definitions.
- Short labels that need 1-2 sentences of help.
- Icon or metric clarification.

Use a product tour for:

- Multi-step orientation that points at specific controls.
- First-run flows where order matters.
- Cross-page demo journeys.

Do not use guidance disclosure for:

- Primary actions.
- Required legal or financial disclosures that must stay visible.
- Error, warning, or confirmation states.
- Empty states where the message is the content.

## ID Convention

Every guide needs a stable `id`.

Use:

```tsx
<GuidanceDisclosure id="surface:feature-or-topic" ... />
```

Examples:

- `create-moment:shared-value`
- `host-dashboard:proof-outcome`
- `liquidity-dashboard:how-it-works`

Use entity-scoped IDs when the guidance is tied to a specific object:

```tsx
guidanceId={`moment-detail:${moment.id}:proof-outcome`}
```

Avoid:

- Display text as IDs.
- Random IDs.
- IDs that change when content wording changes.
- IDs that include personally sensitive values.

## Migrated Surfaces

- `create-proposal:{stepId}` in `CreateProposal`
- `create-moment:invitation-shape`
- `create-moment:arrival-point`
- `create-moment:shared-value`
- `create-moment:participant-action`
- `create-moment:release-rule`
- `piece-profile:{pieceType}`
- `liquidity-dashboard:how-it-works`
- `value-pool:{momentId}:distribution`
- `rewards:point-to-key-path`
- `earnings-dashboard:rules`
- `creator-dashboard:story-in-motion`
- `host-dashboard:room-so-far`
- `host-dashboard:proof-outcome`
- `merchant-dashboard:venue-story`
- `brand-dashboard:cultural-return`
- `brand-dashboard:{campaignId}:proof-outcome`
- `moment-detail:{momentId}:proof-outcome`
- `campaign-detail:{campaignId}:proof-outcome`
- `wallet:economy-path`
- `wallet:proof-receipts`
- `wallet:contribution-limits`
- `promoshare:sponsor-outcome`
- `promoshare:host-layer`
- `promoshare:eligibility-rules`
- `vault:what-you-keep`
- `vault:attendance-receipts`
- `vault:memory-collection`
- `host-guest-operations:scanner`
- `promoshare-admin:overview`
- `promoshare-admin:draw-simulation`
- `promoshare-admin:create-cycle`
- `host-proof-review:decision-context`
- `kyc:unlock-context`
- `kyc:required-unlocks`
- `trading-marketplace:piece-market-context`
- `trading-marketplace:earning-pieces`
- `kyc-admin:review-queue`
- `kyc-admin:submission-decision`
- `offer-studio:activation-context`
- `offer-studio:market-backed-rule`
- `offer-studio:quick-launch`
- `admin-proof-builder:workspace-context`
- `admin-proof-builder:activation-bridge`
- `admin-proof-builder:operator-playbook`
- `admin-growth:north-star`
- `admin-growth:experiment-registry`
- `merchant-integrations:attribution`
- `explore:how-to-choose`
- `explore-rewards:reward-economy`
- `explore-rewards:points-keys-proof`
- `onboarding:first-steps`
- `sub-moments:governance`
- `edit-moment:control-context`
- `content-mission:mission-flow`
- `content-mission:why-it-matters`
- `activation-detail:outcome-context`
- `activation-detail:content-direction`
- `activation-detail:return-review-summary`
- `how-it-works:opportunity-questions`
- `economy:choose-your-path`
- `economy:canonical-flow`
- `why-join:participant-loop`

## Migration Checklist

1. Identify whether the block is education, workflow help, risk context, or required disclosure.
2. Keep required disclosure visible; migrate optional explanation.
3. Keep actions and form controls outside the collapsed region unless the whole panel is purely instructional.
4. Add a stable `id` or `guidanceId`.
5. Preserve summary text that makes the collapsed state useful.
6. Verify in `guided`, `compact`, and `minimal` modes.
7. Run `npm run build --workspace apps/web`.

## Implementation Files

- `apps/web/src/components/guidance/GuidanceDisclosure.tsx`
- `apps/web/src/hooks/useGuidanceProgress.ts`
- `apps/web/src/hooks/useGuidancePreferences.ts`
- `supabase/migrations/202607280002_user_guidance_progress.sql`
