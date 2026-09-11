# AftrHrs at Sea Deck

Dedicated Promorang Moment + venue campaign. This is not a microsite: it reuses Moments, `venue_profiles`, authentication, wallet, staff scan, referrals, telemetry, and admin roles.

## URLs

| Surface | Path |
| --- | --- |
| AftrHrs dedicated landing | `/aftrhrs` |
| Campaign alias | `/campaigns/aftrhrs` → `/aftrhrs` |
| Moment-canonical URL | `/moments/aftrhrs` (same landing, no Promorang chrome) |
| Pass | `/aftrhrs/pass` (`/moments/aftrhrs/pass` still works) |
| Ambassador desk | `/moments/aftrhrs/ambassador` |
| Door validation | `/moments/aftrhrs/door` |
| Admin | `/admin/aftrhrs` and Admin → AftrHrs |
| Sea Deck venue | `/venues/sea-deck` |

Generic `/moments/:id` still works. The AftrHrs UUID (`00000000-0000-0000-0002-000000000080`) redirects to the dedicated page.

## What was reused

- `public.moments` + `public.venue_profiles` / `public.venues` (same pattern as Plantation Cove / Midas)
- `view_public_venue_directory` for `/venues/:slug`
- Auth `next` + `persistPostAuthNext` (session + localStorage) for claim resume after login
- Terms must be accepted before signup. That pending claim auto-issues the Digital Free Pass and opens `/aftrhrs/pass`
- Wallet shows the AftrHrs QR above the Promorang membership card. Signup alone is not the door pass
- Branded AftrHrs RSVP email (`sendAftrHrsRsvpEmail`) with the AftrHrs mark and Powered by PROMORANG
- `telemetry` / `event_analytics_events` rather than a new analytics vendor
- Admin `requireAdmin` / `user_roles`
- Promorang object language (pass, receipt, Moment — not a generic ticket grid)

## Schedule

AftrHrs is a weekly Friday series at Sea Deck from 10:00 PM. The Moment uses Promorang recurrence (`weekly`, weekday Friday / `5`, timezone `America/Jamaica`). Guest copy says **Every Friday** — never a single September 11 date as the only night. Digital pass claims stay open across Fridays; RSVP holders must still arrive before 11:30 PM **that night** to get in free.

## Data

Migrations: `supabase/migrations/202609090001_aftrhrs_sea_deck_event.sql`, then `202609090002_aftrhrs_rsvp_release.sql` (allocation 30, arrival FAQ), `202609090003_aftrhrs_consumer_copy.sql`, and `202609090004_aftrhrs_friday_recurrence.sql`. Production also self-heals Friday recurrence and an open claim window on the first public `/api/aftrhrs/public` read.

New tables (only where no equivalent existed):

- `event_editions` — campaign settings, 30-pass allocation (public guests see remaining as a figure, never the count or how it is calculated), FAQs, policies, artwork
- `event_passes` — digital-free / physical-invitation / paid / guest-list
- `event_ambassador_allocations` + `event_ambassador_requests`
- `event_moment_participations` — lifecycle states
- `event_analytics_events` — funnel
- `venue_follows`

Atomic RPCs (service-role only):

- `claim_aftrhrs_digital_pass` — `FOR UPDATE` on the edition, unique indexes per user/email/phone
- `redeem_aftrhrs_pass` — single-use QR
- `fulfill_aftrhrs_invitation` — allocation cannot go below zero

## Deploy

1. Apply the migration to the target Supabase project.
2. Deploy web and API from the same `main` SHA after merge.
3. Confirm `/api/aftrhrs/public` returns the edition.
4. Set ambassador contact handles only when `contact_consent` is true. Phone numbers are never shown on the public page.

## Assets

Supplied artwork lives at:

- `apps/web/public/campaigns/aftrhrs/logo.jpg`
- `apps/web/public/campaigns/aftrhrs/flyer.jpg`
- `apps/web/public/campaigns/aftrhrs/invite.jpg`
- `apps/web/public/og/aftrhrs.jpg`

Do not alter the supplied logos.

### Insert final files here when available

| Placeholder | Replace with |
| --- | --- |
| `apps/web/public/campaigns/aftrhrs/sea-deck-venue.jpg` | Dedicated Sea Deck venue photography |
| `apps/web/public/campaigns/aftrhrs/alric-boyd.jpg` | Origin / Alric & Boyd still |
| `apps/web/public/campaigns/aftrhrs/promo.mp4` | Promotional video (wire `artwork.video` on `event_editions`) |

Operating hours, telephone, and social handles are admin-optional. They are not invented in seed data.

## Tests

```bash
npm run test:shared
npm test --workspace backend
npm test --workspace apps/web -- src/pages/AftrHrsExperience.test.tsx
```

AftrHrs backend coverage lives in `backend/tests/unit/aftrHrsService.test.js` and is picked up by Jest (`testMatch: **/tests/**/*.test.js`). Do not append that path to `npm test --workspace backend` — extra arguments leak into the follow-on `node --test` command.
