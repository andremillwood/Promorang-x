# Content-first participant experience — implementation contract

## Objective
Restore creator media and cultural storytelling as a first-class participant discovery surface without replacing Moments, Scenes, Drops, PromoCard, or the existing commercial attribution system.

## Confirmed code findings (2026-11-20)
- `apps/web/src/components/feed/ParticipationFeed.tsx` builds its primary participant feed from Moments, perks, discovery polls, Scenes, and Content Drops; standalone published creator content is absent.
- `apps/web/src/services/feed.ts` recognizes the `content` object type, but its direct Supabase fallback fetches only Moments, Discoveries, and Missions.
- `apps/mobile/app/(tabs)/post.tsx` writes creator contributions to `content_items`, supports caption/photo/external URL, and links contributions to Moments when selected.
- `apps/web/src/pages/ContentDrops.tsx` handles distribution releases and their rewards; a release is not the same object as a creator post.
- `SOCIAL_AMPLIFICATION_STRATEGY.md` argues against standalone posts; supersede that recommendation only where it prevents organic cultural storytelling.

## Product invariant
**Content attracts attention; Moments and Scenes organize participation; Drops activate distribution; PromoCard and commerce capture attributable value.** Each remains a distinct object. Do not turn every post into a paid task, or every feed item into a transaction.

## P0 implementation tasks
1. Audit `content_items` visibility, moderation, ownership, storage policies, query indexes, pagination, and web/mobile reading paths. Confirm the published status and approved visibility contract against migrations before changing queries.
2. Introduce a source-backed `creator_content` feed kind to the participant feed model and ranking pipeline, or explicitly reuse the existing canonical `content` type where compatible. Preserve creator identity, media type, caption, publish time, external original URL, and optional Moment/Scene linkage. No fabricated content.
3. Add a bounded, paginated published-content query to `ParticipationFeed`, honoring the same market/following/visibility rules as the rest of the participant experience. Render actual media, attribution, caption, save/share, and an optional linked Moment CTA. Never link a generic content card to an unrelated Moments page.
4. Repair `apps/web/src/services/feed.ts` fallback to include authorized published content, and preserve item-type normalization. If the backend is unavailable, return a truthful empty/error state rather than invented activity.
5. Make `Create → Post something` an obvious participant path on web and mobile, retaining standalone stories without requiring a Moment or Drop. Ensure successful publishing is visible in discovery and the author's profile.
6. Keep content distribution releases in their existing production room. A creator's organic story may reference a release but does not automatically earn rewards.
7. Add instrumentation for impressions, opens, media plays, follows, shares, external clicks, linked Moment opens, signups, and verified actions. Report an attributed funnel without implying causation or inventing revenue.

## Acceptance tests
- A permitted published standalone story appears in the relevant feed and creator profile; draft, pending-review, private, and rejected stories do not.
- Media renders correctly on 320–390px mobile widths and desktop; missing media has a nonmisleading fallback.
- Posts with and without Moment links work; linked CTAs resolve to the correct object.
- Market selection and following filters work; a post outside the market is not silently presented as local.
- Content cannot leak across ownership/visibility boundaries; RLS and API checks agree.
- Pagination is stable, duplicate IDs are deduplicated, and failure states are recoverable.
- Publishing, reading, and sharing work through real authenticated paths, not fixture-only tests.
- Existing Moment, Scene, Drop, PromoCard, and commercial checkout journeys remain intact.

## Rollout
Stage 1: source-backed feed and read-only cards behind a controlled rollout switch.
Stage 2: end-to-end publishing and creator profile exposure.
Stage 3: creator cohort in Kingston, measuring weekly active publishers, content views, shares, referred registrations, Moment opens, and verified participation.

## Release discipline
No automatic production migration, merge, or deployment. Run targeted tests, build, privacy checks, and real-device verification. Open a separate implementation PR with screenshots, measured changes, and rollback notes. Validate demand with real creators before expanding media infrastructure.
