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

A feature is not complete merely because its page renders. Every route that participates in a journey must make its stage and next transition clear.

## P0 invariants

### Intent survives authentication

Valid role, object, claim, proposal, campaign, RSVP, client, Moment, or offer intent must survive authentication. Authentication must never replace a valid requested destination with `/`, a generic dashboard, or a different role unless access is explicitly denied.

### Onboarding has one source of truth

`public.users.onboarding_completed` is the canonical completion state for web account onboarding.

Interests, categories, location, notifications, or profile completeness are optional preference/profile data. They must not be used as substitutes for onboarding completion.

### Roles are additive identities

Every account is at least a participant. Creator, host, merchant, brand, and agency are additional capabilities/workspaces rather than mutually exclusive replacement identities.

Selecting agency must never silently become brand. Selecting host must never silently become merchant. Switching workspaces must not remove previously granted roles.

### Organization context and role context agree

When an organization is active, its organization type and active workspace role must be compatible. Opening a managed agency client may enter that client's brand or merchant workspace, but the user must always have a visible route back to the agency portfolio.

### URL state is resumable

Important workspace state that changes what the person is looking at should survive refresh, browser back/forward, and a shared link when safe. Examples include dashboard tab, selected client/account, object ID, workflow step, and return destination.

### Progress comes from real state

A milestone, progress bar, completion badge, or success message may only advance from persisted or verifiable product state. Page views and button clicks are not proof of completion unless explicitly defined as the outcome.

### Every primary action closes a loop

Every primary CTA requires access handling, loading, success, failure/recovery, a persisted result, and a next useful move. No primary CTA may be visual-only or no-op.

### Empty states teach the first move

- Agency with zero clients → connect first client.
- Host with zero Moments → create first Moment.
- Merchant with zero inventory → put first real perk/offer up.
- Brand with zero campaigns → define first outcome/activation.
- Participant with no activity → find one useful action.

### Success preserves context

After create/edit/claim/verify/submit, land on the created/updated object, the workspace state reflecting the result, or the next step in the same job. Do not send successful users to a generic home page unless that home is intentionally the next step.

### Errors preserve work

Validation, network, permission, or server errors should not discard entered data or lose originating context. State what failed, whether anything was saved, and the recovery action.

## First-hour contracts

| Role | First useful result | Canonical first workspace |
| --- | --- | --- |
| Participant | Has a PromoCard and completes/claims one useful action | `/card` / member surfaces |
| Creator | Publishes a real Release/drop or moves a real offer | `/content-drops` |
| Host | Creates a real Moment and has a path to participant proof | `/create/moment` / host studio |
| Merchant | Puts real inventory/perk up and can validate use | `/stock` / merchant studio |
| Brand | Defines and launches one attributable customer outcome | brand studio |
| Agency | Connects a real client before operating client work | `/dashboard?view=studio&tab=clients` |

## Destination priority after authentication

1. valid task-specific return destination;
2. unfinished low-friction claim/pass flow;
3. required onboarding for generic first-run entry;
4. explicit user start-page preference;
5. active-role canonical home;
6. participant home as final fallback.

Never fall back to the public homepage for an authenticated user because route resolution failed.

## QA journey matrix

Test these paths at desktop and mobile widths whenever auth, navigation, roles, onboarding, dashboard state, or primary actions change:

- new participant → signup → onboarding → first action → refresh → return;
- new creator → signup → onboarding/first action → creator workspace;
- new host → signup → create Moment → return to host workspace;
- new merchant → signup → put inventory up → validation path;
- new brand → signup → first activation;
- new agency → signup → connect client → open client → return to agency;
- existing multi-role user → login → correct active role → switch role → refresh;
- existing user with deep link → login → original job;
- saved start-page preference → login → authorized preferred workspace;
- failed create/submit → recovery without losing input;
- empty workspace → clear first action;
- hard refresh/back/forward on a non-default dashboard tab.

## Definition of done

A journey change is complete only when role and organization identity remain correct, post-auth/onboarding destinations are deterministic, completion state is persisted, URL/back/refresh behavior is intentional, empty/loading/success/error states are defined, the next meaningful action is visible, mobile and desktop capability differences are intentional, and no production proof, balances, outcomes, or verification are fabricated to make the journey appear complete.
