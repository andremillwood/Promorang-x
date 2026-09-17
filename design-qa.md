# PROMORANG participant visual QA

- Source visual truth: `/workspace/scratch/caef2f77e0f6/upload/promroang-home-newdraft.png`
- Source pixels: `864 × 1821`
- Implementation: `http://terminal.local:4173/app-preview?role=participant`
- Implementation evidence: Cloud Browser tab 1, viewport capture emitted in the build session
- Implementation viewport: `1344 × 938` CSS pixels at device scale 1
- State: participant preview with source-backed Kingston Moment feed and empty PromoCard
- Normalization: compared responsive desktop content regions rather than pixel scaling the tall source board; browser chrome and preview-only role controls were excluded from fidelity judgments

## Full-view comparison evidence

The revised screen now carries the source board's defining composition: black cultural canvas, warm full-bleed photographic hero, condensed white/orange display type, compact high-contrast CTAs, image-led interest rail, dense content rhythm and restrained orange accents. The authenticated production shell provides the navigation omitted by the preview-only route.

## Focused comparison evidence

Focused checks covered the hero hierarchy, headline wrapping, CTA treatment, category-card crop, section rhythm and current-move truth. These regions required separate inspection because their copy and image relationships determine whether the page reads as a cultural platform rather than a dashboard.

## Comparison history

### Iteration 1

- P1: A generic culture photograph read as event-specific imagery for a museum listing.
- P1: The global feed allowed Cayman inventory to appear under a Kingston Today label.
- P2: The initial display face was broad rather than condensed and lacked the source board's poster-like authority.

Fixes made:

- Reframed the photograph as the cultural promise, with the actual current move presented explicitly as source-backed text and action.
- Filtered Today and Now & next to the participant's local city before resolving a Moment.
- Added Anton for the hero display treatment and reproduced the source's white/orange headline hierarchy.

Post-fix evidence:

- Browser-rendered hero reads “SHOW UP TO SOMETHING BIGGER” while separately naming the real Kingston move and venue.
- Local feed resolved Sunriser’s Pickleball Tournament and Blue Run 5K rather than Cayman inventory.
- Music category navigation successfully reached `/discover?tab=moments&category=music`.
- Primary Today CTA remained visible after navigation recovery.
- No application console errors were recorded; two extension-origin metadata errors were excluded.

### Iteration 2 — PromoCard primacy

- P1: PromoCard appeared as a separate downstream module, making the platform's primary product object read as secondary to discovery.
- P1: The Today fallback could combine a current-move title with the venue from the first unrelated local Moment.

Fixes made:

- Moved the live PromoCard face into the opening hero and added a top-level `Open PromoCard` action beside the immediate-move action.
- Removed the downstream PromoCard module so the card is introduced once, at primary hierarchy.
- Limited venue display to a Moment matched by canonical href/id/slug or exact title; unmatched moves no longer inherit another Moment's venue.
- Added the non-secondary PromoCard rule to `DESIGN.md`.

Post-fix evidence:

- The refreshed browser capture shows the PromoCard as a dominant physical object within the first viewport.
- The primary PromoCard CTA navigated successfully to `/app-preview/card?role=participant`.
- The mismatched FAT Wednesdays / Smash Yard pairing is no longer possible through the fallback resolver.
- No application-origin console errors were recorded; extension-origin metadata errors were excluded.

## Required fidelity surfaces

- Fonts and typography: passed. Condensed Anton hero face, tight uppercase leading and orange emphasis now match the reference hierarchy; DM Sans and Fraunces remain for product copy and editorial headings.
- Spacing and layout rhythm: passed. Wide hero, paired primary CTAs, first-viewport PromoCard, six-card interest rail and denser section cadence follow the source while retaining responsive wrapping.
- Colors and visual tokens: passed. Near-black canvas, white type, warm orange action color and restrained borders align with the source.
- Image quality and asset fidelity: passed. Existing production raster assets are used with deliberate crops; no placeholder or code-drawn imagery replaces visible photographic content.
- Copy and content: passed. The cultural promise follows the source direction while Moments, locations, PromoCard state and consequences remain source-backed. PromoCard is explicitly identified as the primary access layer.

## Findings

No actionable P0, P1 or P2 findings remain in the verified desktop participant preview.

## Follow-up polish

- P3: Replace the general cultural hero with commissioned Kingston campaign photography when a final owned asset library is available.
- P3: Remove preview-only role chips from future visual review captures; they are not present on the authenticated route.

## Primary interactions tested

- Opened the Music interest lane and verified navigation to the filtered Discover route.
- Returned to the participant preview and verified the Today CTA remained visible.
- Opened the primary PromoCard CTA and verified navigation to the participant card route.
- Checked browser console output for application errors.

final result: passed
