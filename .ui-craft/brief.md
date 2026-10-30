# Promorang design brief

## Design intent
A warm, human platform for discovering local experiences, businesses and rewards. Help visitors find an actual next step before explaining the wider ecosystem.

## Audience
Participants exploring nearby events and discoveries, plus merchants, creators, brands and hosts. Support narrow phones and keyboard navigation.

## Voice and tone
Direct, inviting, locally specific. Distinguish empty inventory from failed requests. Never imply illustrative benefits were issued.

## Constraints
Preserve the existing orange/cream/charcoal identity, DM Sans typography, photography and brand materials. Use the React/Vite/Tailwind stack and existing semantic tokens. Respect reduced motion. Existing uncommitted material work is outside this pass.

## Review scope
Initial pass: production public homepage (`/` → Index → PublicMarketHome). Browser viewport checks completed at 320–1920px, with keyboard, reduced-motion and long-title checks. See surfaces/public-home.md for evidence and limits.

Participant dashboard: `/dashboard` uses PeopleHome by default; Studio is a separate view. See surfaces/participant-dashboard.md for the logged-in UI fixture verification and scope.

## Platform design rules — 2026-10-20

Reference: Maya Brennan, [How to de-slopify your designs](https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9).

Apply its critique-and-iteration process to Promorang's existing identity:
- Prioritize the visitor's decision. Show each primary action once and each metric once within a component.
- Use DM Sans for working interfaces; reserve expressive display type and materials for intentional brand moments.
- Use orange to identify the main action. Secondary utilities stay neutral; preserve semantic status and benefit colors.
- Remove redundant category labels, arbitrary numbering, decorative icon containers, oversized hero spacing and heavy ambient shadows when they obscure the task.
- Status labels such as live, verified, paid and redeemed require supporting data. Never decorate a workspace with a fabricated status.
- Empty/error states explain what happened and what to do next. Do not expose internal design claims.
- Reference existing approved Promorang surfaces, then verify mobile/desktop, long text, keyboard access, loading and recovery. Never treat a generated first pass as finished.

Roll out through shared components, followed by individual screen reviews. This is a design direction, not a claim that every platform surface has been reviewed.

Role-workspace rollout and verification: `surfaces/role-dashboards.md` (Creator, Host, Merchant, Brand and Agency).

Deeper role-panel cleanup and state verification: `surfaces/deep-role-panels.md`.

Role task-flow recovery, dialog and mobile/desktop checks: `surfaces/role-task-flows.md`.

## Learned constraint — 2026-10-28
Use NCB Jamaica, Sagicor Jamaica and Conlive as directional references for strong page hierarchy, direct task routes, photography and confident typography. Preserve Promorang identity. Prefer open sections, spacing and tonal surfaces to nested rounded cards. Actions use 2px corners; reserve curves for tangible PromoCards, avatars and intentional brand elements. Ordinary panels do not receive an outline by default. Keep 1px gradient treatments for critical brand elements such as the existing header; do not distribute decorative gradient frames across content. Preserve accessible focus outlines, meaningful selection indicators and form/error affordances.

## Learned correction — 2026-10-29
Removing rounded cards and arbitrary borders is not the design concept. Do not flatten Promorang into lifeless square panels or a generic dark dashboard. Let people, event artwork, photography and the tangible PromoCard carry the identity. Use changes in composition, image scale, warm paper and dark surfaces to separate discovery, participation and operations. Keep controls efficient and gradient borders reserved for critical brand moments. Validate distinction visually, separately from functional tests. Homepage composition: full-bleed photographic opening, followed by a live poster board. Participant composition: photographic welcome with the real credential, followed by activity and a warm photographic scene guide. This overrides the previous blanket 2px-shape interpretation.

## Hero and homepage correction — 2026-10-29
Preserve the approved photographic banner and integrate its tabbed offers/events/missions showcase within the hero. Real inventory rotates with pause, interaction and reduced-motion safeguards; request forms never rotate away. Carry the same visual care below the fold through photographic category browsing, poster-led events, open partner routes and the actual PromoCard. A good hero above bland panels is unfinished.

## Marketing convergence — 2026-10-29
Carry the consumer identity across public role, business and product explanation pages: role-specific existing photography, Anton opening headlines, Fraunces editorial sections, open outcome navigation and actual PromoCard materials. Do not replace generic rounded cards with equally generic dark rectangles. Every page owns its next step; avoid a competing scene-discovery footer CTA on partner entry pages. Verify complete pages and interactive entry states, not only hero screenshots. Five-iteration review and verification evidence: `surfaces/marketing-pages.md`.
