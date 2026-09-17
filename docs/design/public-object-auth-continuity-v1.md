# Public Object → Auth → Object Continuity v1

Status: implementation slice on `andre/public-experience-convergence-v2`, stacked on the canonical object branch.

## Thesis

Authentication is a checkpoint in an object journey, not a destination.

When a person enters PROMORANG through a real public object, authentication must preserve that object and its attribution context rather than sending the person to a generic dashboard.

Human expectation:

`PUBLIC OBJECT → ACTION INTENT → AUTH → SAME OBJECT → CONTINUE`

Canonical truth still governs the state transition after return.

## Object routes covered by the fallback contract

The public-object classifier currently recognizes detail routes for:

- approved Discoveries,
- Demand / acquisition questions,
- Moments,
- commerce listings,
- merchant storefronts,
- Scenes,
- creator profiles,
- venue profiles,
- brand profiles,
- event detail,
- drops,
- content drops.

Protected subroutes such as Moment check-in are intentionally not classified as public-object detail routes; `ProtectedRoute` already preserves their explicit `next` path.

## Two continuity mechanisms

### 1. Explicit next wins

Any action that can construct an auth URL should use the existing `authPathForReturn(...)` contract.

Examples:

- commerce purchase,
- offer claim,
- save actions,
- explicit PromoCard / commercial flows.

The full current path is retained, including search parameters and hash state.

### 2. Public-object fallback

Some legacy public surfaces still call `/auth` without an explicit `next`.

`RouteScrollManager` now observes a transition from a recognized public object directly into `/auth`. If Auth does not already contain its own explicit `next`, the previous object URL is persisted through the existing post-auth return store.

This means older Moment RSVP and similar public-object flows no longer have to fall through to a generic landing page merely because the caller omitted `next`.

## Precedence

The continuity fallback must never override an explicit destination.

Order:

1. explicit `next` on Auth,
2. explicit ProtectedRoute return,
3. captured public-object return,
4. account landing preference,
5. role default.

## Truth boundary

Returning to the same object is automatic.

Completing the action is **not** automatically fabricated.

Examples:

- returning to a Moment does not mean RSVP occurred,
- returning to an Offer does not mean a claim was issued,
- returning to a commerce item does not mean a purchase occurred,
- returning to a Discovery does not mean it was saved,
- returning to proof does not mean verification occurred.

The person resumes at the object, then the canonical action path decides what is actually allowed to happen.

This protects:

`AUTH RETURN ≠ ACTION COMPLETION`

and preserves the broader canonical rules:

`INTENT ≠ ATTENDANCE`

`CLAIM ≠ ISSUANCE`

`PURCHASE INTENT ≠ PURCHASE`

`SUBMISSION ≠ VERIFICATION`

## PromoCard relationship

PromoCard is the participant continuity surface after real issuance / retained consequences exist.

The auth-return contract therefore does not invent a PromoCard asset merely because a person authenticated from an object. Instead:

- return them to what they were acting on,
- let the canonical action complete if eligible,
- let actual issued access / proof / retained consequence flow into PromoCard and Vault through the existing authoritative sources.

This keeps PromoCard meaningful rather than turning authentication itself into a reward event.

## Implementation anchors

- `apps/web/src/lib/public-object-continuity.ts`
- `apps/web/src/lib/public-object-continuity.test.ts`
- `apps/web/src/components/RouteScrollManager.tsx`
- `apps/web/src/lib/post-auth-next.ts`
- `apps/web/src/components/onboarding/PostLoginRouter.tsx`
- `apps/web/src/hooks/useCommerceActions.ts`

## Next validation

Test these journeys with real records:

1. public Moment → RSVP while logged out → Auth → same Moment with original campaign / referral parameters,
2. public commerce item → purchase / claim while logged out → Auth → same item,
3. public Discovery / Demand → Auth from object → same object,
4. OAuth callback → post-login → same captured public object,
5. explicit `next=/card` from a public object still wins over fallback capture,
6. protected check-in / proof routes continue to use ProtectedRoute rather than the public-object fallback.
