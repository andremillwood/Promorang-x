# PROMORANG Journey Integrity Standard

**Status:** Canonical product and UX rule  
**Applies to:** public acquisition, authentication, onboarding, role switching, organization switching, dashboards, creation flows, claims, rewards, settings, and return visits.

## Objective

A person should never have to reconstruct what PROMORANG expects them to do.

Every meaningful journey must preserve five answers:

1. **Where am I?** — the current role, account/client context, and workspace are visible.
2. **Why am I here?** — the job this surface helps complete is stated in human terms.
3. **What do I do next?** — one primary next action is obvious.
4. **What counts as done?** — completion is tied to persisted product state or verified proof.
5. **What happens after that?** — success advances to the next useful move instead of a dead end.

## Canonical journey shape

`Entry → Intent → Identity → Required setup → First useful action → Proof → Result → Next move → Return`

Every route that participates in a journey must declare which stage it represents. A feature is not complete merely because its page renders.

## P0 invariants

### 1. Intent survives authentication

If a person signs in or signs up because they selected a host, creator, merchant, brand, agency, participant, client, Moment, offer, claim, or other valid destination, that intent must survive authentication and any required onboarding.

Authentication must never replace a valid requested destination with `/`, a generic dashboard, or a different role unless access is explicitly denied.

### 2. Onboarding has one source of truth

`public.users.onboarding_completed` is the canonical completion state for web account onboarding.

Optional interests, categories, location, notifications, or profile completeness must not be used as substitutes for onboarding completion. A commercial user can legitimately complete onboarding without consumer discovery preferences.

### 3. Roles are additive identities

Every account is at least a participant. Additional roles such as creator, host, merchant, brand, or agency are capabilities/workspaces, not mutually exclusive replacement identities.

Selecting an agency must never silently become brand. Selecting host must never silently become merchant. Switching workspaces must not remove previously granted roles.

### 4. Organization context and role context agree

When an organization is active, its organization type and the active workspace role must be compatible. Switching to a managed agency client may enter that client's brand or merchant workspace, but the user must always have a visible path back to the agency portfolio.

### 5. URL state is resumable

Important workspace state that changes what the user is looking at must survive refresh, back/forward navigation, and a shared link when safe to do so.

Examples: dashboard tab, selected client/account, object ID, workflow step, and return destination.

Ephemeral presentation state does not need to be encoded in the URL.

### 6. Progress is derived from real state

A progress bar, milestone, completion badge, or success message may only advance from persisted or verifiable state. Page views and button clicks alone are not proof of completion unless the product contract explicitly defines them as the result.

### 7. Every primary action has a completion route

A primary CTA must have all of the following:

- permission/access handling;
- loading state;
- success state;
- failure state with recovery;
- persisted result;
- a next useful move.

No primary CTA may be a visual-only or unhandled control.

### 8. Empty states teach the next move

An empty workspace is not a blank dashboard. It must explain why it is empty and provide the action that creates the first meaningful object or relationship.

Examples:

- Agency with zero clients → connect first client.
- Host with zero Moments → create first Moment.
- Merchant with zero inventory → put first real perk/offer up.
- Brand with zero campaigns → define first outcome/activation.
- Participant with no activity → find one useful action nearby.

### 9. Success preserves context

After create/edit/claim/verify/submit actions, the user should land on either:

- the created/updated object;
- the workspace state that reflects the result; or
- the next step in the same job.

Do not send successful users to a generic home page unless the home page is explicitly the next step.

### 10. Errors preserve work

Validation, network, permission, or server errors should not discard entered data or lose the originating context. Errors must state what happened, whether the action was saved, and what the user can do next.

## Role first-hour contracts

| Role | First useful result | Canonical first workspace |
| --- | --- | --- |
| Participant | Has a PromoCard and completes/claims one useful action | `/card` / member surfaces |
| Creator | Publishes a real Release/drop or moves a real offer | `/content-drops` |
| Host | Creates a real Moment and has a path to participant proof | `/create/moment` / host studio |
| Merchant | Puts real inventory/perk up and can validate use | `/stock` / merchant studio |
| Brand | Defines and launches one attributable customer outcome | brand studio |
| Agency | Connects a real client before operating client work | `/dashboard?view=studio&tab=clients` |

## Navigation contract

PROMORANG has stable destinations across roles. Role changes the language, data, available actions, and success criteria — not the existence of an entirely different product.

The shell must always provide:

- current role/workspace;
- current organization/client when applicable;
- a role/account switcher when the user has more than one;
- a path to the role home;
- a path to Settings/help/recovery;
- one context-aware primary next action on the working surface.

## Acquisition and return priority

When selecting a destination after authentication, use this order:

1. valid explicit return destination;
2. unfinished low-friction claim/pass flow where required;
3. required onboarding, while preserving the return destination;
4. explicit user start-page preference when implemented;
5. active-role canonical home;
6. participant home as final fallback.

Never fall back to the public homepage for an authenticated user because route resolution failed.

## QA journey matrix

Every release that changes navigation, auth, roles, onboarding, dashboard state, or primary CTAs should exercise at least these paths on desktop and mobile widths:

- new participant → signup → onboarding → first action → refresh → return;
- new creator → signup → onboarding → creator first action;
- new host → signup → onboarding → create Moment → return to host workspace;
- new merchant → signup → onboarding → put inventory up → validation path;
- new brand → signup → onboarding → first activation;
- new agency → signup → onboarding → connect client → open client → return to agency;
- existing multi-role user → login → correct active role → switch role → refresh;
- existing user with explicit deep link → login → required setup → original deep link;
- failed create/submit action → recovery without losing input;
- empty workspace → clear first action;
- browser back/forward and hard refresh on a non-default dashboard tab.

## Definition of done

A journey change is complete only when:

- role and organization identity remain correct;
- the destination after auth/onboarding is deterministic;
- completion state is persisted;
- URL/back/refresh behavior is intentional;
- empty, loading, success, and error states are defined;
- the next meaningful action is visible;
- mobile and desktop do not expose materially different capabilities without intent;
- no production proof, balances, outcomes, or verification are fabricated to make the journey appear complete.
