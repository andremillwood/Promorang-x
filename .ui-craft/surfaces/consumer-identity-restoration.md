# Consumer identity restoration — 2026-10-29

The previous pass removed surface detail without replacing it with a distinct composition. This pass rebuilds the public homepage and participant home around existing Promorang imagery, poster artwork and the actual PromoCard model. Operator dashboards and shared global controls are intentionally outside this pass.

| Previous issue | Implemented change | Reason |
| --- | --- | --- |
| Small, similar blocks inside a dark opening | Full-bleed photographic opening with the existing Anton display face | Give the consumer entrance a recognizable focal point |
| Event artwork isolated in a generic panel | Warm poster board with uncropped artwork and adjacent programme information | Let the actual opportunity carry the design |
| Participant identity reduced to a small Card link | Photograph-led welcome beside the real PromoCard on warm paper | Make the credential tangible without inventing a balance or benefit |
| Repeated search and event cards | One search; canonical events stay in the local calendar while other activity uses the feed | Reduce repetition and keep the next action clear |
| Large empty saved-items area | Full-width saved-items route | Preserve access without a filler panel |
| Uniform dark sections | Photographic welcome, warm scene guide and open activity sections | Establish a hierarchy through composition rather than arbitrary outlines |

## Visual acceptance
- Public: dominant photo/headline; clear primary discovery action; visible event artwork; original header gradient retained.
- Participant: visible photo on phones, legible credential, one search, one rendering of each calendar event, and a warm photographic interest guide.
- Existing lifestyle imagery is brand imagery, not a claim about a named venue. Inventory, credentials, dates and benefits remain sourced from the existing data model.
- Composition selected deliberately as full-bleed overlay + poster board. ui-craft fold-candidate/check tools were unavailable; composition was verified from browser renders instead.

## Verification
- Public and participant renders at 320, 390, 768 and 1440px: no page overflow or runtime errors.
- Empty and populated participant fixtures at 390 and 1440px: one search form; populated calendar has one link to the fixture event. No broken images.
- Existing geographic filtering, calendar retry, public sparse/error states and artwork/data-boundary tests: 12 tests passed across 3 suites.
- Shared-component/page lint passed. The existing explicit-any database typing in ParticipationFeed predates this pass and remains outside the UI work.
- Keyboard focus retains visible outlines. Card hover rotation is disabled under reduced motion; no entrance or auto-rotation animations were added.
- Hero asset encoded to JPEG at 272 KB from the existing 1.5 MB PNG; the original asset is preserved.
- Local fixture session and preview entrypoints are removed before release. Browser fixtures do not validate live authorization, claims or transactions.

## Finish review
Hierarchy, named type roles, warm/dark surface separation, mobile reflow, focus affordances, content truth and image loading were checked independently of the build. Three existing families have explicit roles: Anton for poster-scale consumer titles, Fraunces for editorial headings, and DM Sans for controls and prose. This is an intentional Promorang type system rather than an accidental third face. The successful build is a functional gate, not the evidence for visual distinction.
