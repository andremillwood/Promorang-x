# AftrHrs at Sea Deck

Dedicated Promorang Moment + venue campaign. This is not a microsite: it reuses Moments, `venue_profiles`, authentication, wallet, staff scan, referrals, telemetry, and admin roles.

## URLs

| Surface | Path |
| --- | --- |
| AftrHrs landing / Moment | `/moments/aftrhrs` |
| Alias | `/aftrhrs` → `/moments/aftrhrs` |
| Pass / wallet presentation | `/moments/aftrhrs/pass` |
| Ambassador desk | `/moments/aftrhrs/ambassador` |
| Door validation | `/moments/aftrhrs/door` |
| Admin | `/admin/aftrhrs` and Admin → AftrHrs |
| Sea Deck venue | `/venues/sea-deck` |

Generic `/moments/:id` still works. The AftrHrs UUID (`00000000-0000-0000-0002-000000000080`) redirects to the dedicated page.

## What was reused

- `public.moments` + `public.venue_profiles` / `public.venues` (same pattern as Plantation Cove / Midas)
- `view_public_venue_directory` for `/venues/:slug`
- Auth `next` + `persistPostAuthNext` for claim resume after login
- Existing ticket confirmation email (`sendTicketPurchaseEmail`)
- `telemetry` / `event_analytics_events` rather than a new analytics vendor
- Admin `requireAdmin` / `user_roles`
- Promorang object language (pass, receipt, Moment — not a generic ticket grid)

## Data

Migration: `supabase/migrations/202609090001_aftrhrs_sea_deck_event.sql`

New tables (only where no equivalent existed):

- `event_editions` — campaign settings, 20-pass allocation, FAQs, policies, artwork
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
