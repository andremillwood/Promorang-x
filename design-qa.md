# PROMORANG Design QA

## Source visual truth

Selected Product Design ideation result: **option 3 — Marks / collectible ritual**.

Reference used for comparison:

`/mnt/data/wide_dark_presentation_brand_concept_spread_in_a_m.png`

Reference pixels: **1536 × 1024**.

Core visual truth:
- PROMORANG P as identity anchor
- asymmetric boomerang / Return Arc as a proprietary movement mark
- dotted Tracks as journey / connection language
- circular Marks as proof / kept language
- earth / ochre / sand / gold material palette
- image-led Today and Discover
- tactile PromoCard / ticket / receipt / relic object family
- brand character appears through repeated behavior and material, not generic icons

## Implementation target

Design Lab section:

`10 · PROMORANG brand grammar`

Current refined implementation:

`apps/web/src/design-system/consumer/PromorangBrandGrammarStudyV2.tsx`

## Rendered evidence — iteration 1

User-provided desktop captures:

- `/mnt/data/Screenshot 2026-09-16 at 1.43.43 AM.png` — 2048 × 1181
- `/mnt/data/Screenshot 2026-09-16 at 1.44.07 AM.png` — 2048 × 1428
- `/mnt/data/Screenshot 2026-09-16 at 1.44.21 AM.png` — 2048 × 1423
- `/mnt/data/Screenshot 2026-09-16 at 1.44.33 AM.png` — 2048 × 364

Combined normalized comparison generated at:

`/mnt/data/promorang_brand_qa_comparison.jpg`

The source and implementation are not one identical viewport because the implementation section is taller than the source concept board. For full-view comparison, both were normalized to the same review width and the implementation captures were stacked in document order. This is sufficient for composition / brand-fidelity review but not for pixel-perfect 1:1 phone-state comparison.

## Build validation

The pre-refinement brand implementation passed GitHub Actions `Web Build`.

The refined implementation is independently validated by the same workflow before handoff.

## Primary interactions

Implemented:
- brand-mark selector
- PromoCard Ready / Showing / Validating / Used state selector
- state-advance CTA
- Today / Discover navigation specimens
- object family specimens

Browser interaction and console verification remain dependent on the user's local rendered surface because Vercel Hobby preview generation is rate-limited.

## Findings — iteration 1

- [P1] **Return Arc reads as a generic undo icon**
  - Location: Brand Elements, Today return cue, social context, PromoCard.
  - Evidence: selected source uses a proprietary asymmetric boomerang-like brush arc; iteration 1 used Lucide `Undo2` inside circles.
  - Impact: the most important PROMORANG brand behavior looked like standard utility UI rather than an ownable signature.
  - Fix applied: extracted the actual selected Return Arc from the source board into a real raster brand asset and replaced generic return-icon usage in the refined study.

- [P1] **Brand marks are generic icon-library semantics rather than a coherent mark family**
  - Location: Move / Explore / Return / Proof / Kept selector and bottom grammar strip.
  - Evidence: source uses arc, dotted track and concentric mark forms; iteration 1 used Footprints / Route / Undo / Stamp / Archive icons.
  - Impact: labels carried the concept but the visual system did not become recognizably PROMORANG.
  - Fix applied: refined study uses source-derived Return Arc, Tracks and Ring assets as the visible brand glyph family; utility icons remain only where they are utility.

- [P1] **PromoCard lacks source materiality and integrated movement marks**
  - Location: Object Family / PromoCard credential.
  - Evidence: source integrates warm earth/gold material, arc/track detail and an emblematic mark into the card body; iteration 1 is predominantly flat black with metadata columns.
  - Impact: the card is legible but not as ownable or collectible as the selected visual target.
  - Fix applied: refined PromoCard adds clay/earth illumination, source-derived Return Arc watermark, Tracks embedded into the card surface and a source-derived proof ring while preserving credential state logic.

- [P2] **Brand Elements panel is too diagrammatic / clinical**
  - Location: opening brand grammar region.
  - Evidence: source feels like a living brand world; iteration 1 presents a P beside a standard icon and separate chips.
  - Impact: brand personality is explained more than experienced.
  - Fix applied: refined panel physically pairs P + Return Arc, integrates Tracks into the surface, and makes each selectable mark display a visual brand glyph rather than an icon-library symbol.

- [P2] **Today / Discover carry the new copy but not enough of the selected visual grammar**
  - Location: both phone specimens.
  - Evidence: content hierarchy matches the mature consumer direction, but option 3 contains visible movement paths / return marks embedded into the content world.
  - Impact: product still risks reading as premium black/orange marketplace UI with PROMORANG labels.
  - Fix applied: refined screens use actual Tracks / Return Arc overlays in restrained positions and replace text-only mark tags with the brand glyph family.

- [P2] **World treatment is cinematic but generic**
  - Location: full-width world-treatment banner.
  - Evidence: source combines real place imagery with a distinctive return/track intervention; iteration 1 is mostly landscape + headline.
  - Impact: world imagery does not yet demonstrate how PROMORANG marks a place without becoming a decorative theme.
  - Fix applied: refined world surface overlays source-derived Return Arc and Tracks with controlled opacity and keeps the photography dominant.

## Fidelity surfaces

### Fonts / typography
Iteration 1: generally aligned with source — Fraunces editorial + quiet sans utility. No P1 typography mismatch. Some Design Lab micro-labels remain smaller than the recommended production floor and are acceptable only as specification labels, not production body copy.

### Spacing / layout rhythm
Iteration 1: hierarchy and large-section rhythm are strong. The implementation is intentionally taller and more explanatory than the concept board because it is a review surface. This is acceptable; production screens remain compact.

### Colors / tokens
Iteration 1: palette is aligned with the selected direction. Refined version increases Clay / Sand / Gold material presence so black + orange do not carry the entire identity.

### Image quality / asset fidelity
Iteration 1: stock photography is adequate for placeholder evaluation. Major brand-asset fidelity failed because arc/tracks/marks were approximated with icon components. Refined version uses actual source-derived raster brand assets.

### Copy / content
Iteration 1: product copy is strong and aligned with movement / return semantics. Refined version reduces explanation where the new marks can communicate visually.

## Comparison history

### Iteration 1
Rendered implementation captured by user and compared against source option 3.

Actionable P1/P2 issues:
- generic undo-arrow return mark
- generic icon-library mark family
- insufficient PromoCard materiality
- under-branded Today / Discover world layer
- generic world-treatment banner

### Iteration 2 fixes
Implemented in `PromorangBrandGrammarStudyV2.tsx`:
- actual source-derived Return Arc asset
- actual source-derived dotted Tracks asset
- actual source-derived Ring / proof mark
- brand glyphs replace generic icons in brand grammar contexts
- P + Return Arc pairing
- embedded Tracks / Arc in Today, Discover, PromoCard and World
- warmer clay / gold credential material treatment
- existing utility icons preserved only for utility jobs

## Remaining verification

A revised local screenshot is required after pulling the refined study. Compare:
1. Brand Elements / P + Return Arc.
2. Today / Discover at readable phone scale.
3. PromoCard / object family.
4. World treatment and bottom mark strip.
5. PromoCard state progression.
6. Local browser console for runtime errors.

If the refined render removes the P1/P2 mismatches above without introducing new P1/P2 issues, QA can move to `passed` with only P3 polish remaining.

final result: blocked
