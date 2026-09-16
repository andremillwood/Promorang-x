# PROMORANG Design QA

## Source visual truth

Selected Product Design direction: **option 3 — Marks / collectible ritual**.

Reference board:

`/mnt/data/wide_dark_presentation_brand_concept_spread_in_a_m.png`

Reference pixels: **1536 × 1024**.

Core visual truth:
- PROMORANG P as identity anchor
- asymmetric movement / return arc
- dotted Tracks as journey / connection language
- distinct marks for movement / proof / retained value
- earth / ochre / sand / gold material palette
- image-led Today and Discover
- tactile PromoCard / Ticket / Receipt / Relic family
- brand character through repeated product behavior, not generic utility icons

## Implementation targets

Iteration 1:
`apps/web/src/design-system/consumer/PromorangBrandGrammarStudy.tsx`

Iteration 2:
`apps/web/src/design-system/consumer/PromorangBrandGrammarStudyV2.tsx`

Final discipline pass:
`apps/web/src/design-system/consumer/PromorangBrandGrammarFinal.tsx`

## Rendered evidence — iteration 1

User-provided captures:
- `/mnt/data/Screenshot 2026-09-16 at 1.43.43 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.44.07 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.44.21 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.44.33 AM.png`

Iteration 1 comparison found major P1/P2 brand-fidelity drift: generic Undo icon, Lucide mark vocabulary, insufficient PromoCard materiality, under-integrated Tracks / Arc, generic World treatment.

## Rendered evidence — iteration 2

User-provided captures:
- `/mnt/data/Screenshot 2026-09-16 at 1.52.48 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.53.06 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.53.19 AM.png`
- `/mnt/data/Screenshot 2026-09-16 at 1.53.27 AM.png`

Full-review montage:
`/mnt/data/brand_qa_full_montage.jpg`

Iteration 2 resolved the largest identity failure: PROMORANG now reads as a coherent brand system rather than premium black/orange UI with labels.

## Findings — iteration 2

- [P1] **Move / Return are still too visually similar**
  - Location: brand-mark selector, Discover rows, bottom grammar strip.
  - Evidence: both are derived from the same brush arc form and differ mainly through labels / context.
  - Impact: the mark system is not yet learnable without text.
  - Fix implemented in final pass: five distinct proprietary vector meanings. Move is outward/open; Explore is dotted waypoint motion; Return reverses direction; Proof is concentric/resolved; Kept is contained/closed.

- [P1] **Proof / Kept are insufficiently differentiated**
  - Location: PromoCard proof cue, Kept grammar mark, PromoKey / collectible contexts.
  - Evidence: both rely on the same ring asset.
  - Impact: verification and retention collapse into one visual meaning.
  - Fix implemented in final pass: Proof is a concentric stamp with confirmed center; Kept is a closed rounded container with nested retained center.

- [P2] **Return Arc is repeated too literally**
  - Location: Today header / recommendation, Discover hero / rows, PromoCard, World treatment.
  - Evidence: iteration 2 uses the arc often enough that it begins to behave like decorative wallpaper rather than semantic product language.
  - Impact: premium restraint is reduced and meaning weakens through repetition.
  - Fix implemented in final pass: one major proprietary gesture per viewport. Today keeps Return only where provenance is explained; Discover uses semantic marks per opportunity; PromoCard uses a subtle single Return state watermark; World uses Explore rather than another Return Arc.

- [P1] **World imagery contradicts Kingston context**
  - Location: World treatment.
  - Evidence: rendered placeholder visibly depicts Rio / Christ the Redeemer while the section claims a Kingston / PROMORANG world.
  - Impact: breaks location trust immediately.
  - Fix implemented in final pass: replacement image is a free Unsplash photograph taken on Red Hills Road, Kingston, Jamaica.

- [P2] **Object family still needs stronger material differentiation**
  - Location: PromoCard / Ticket / Receipt / Relic / PromoKey.
  - Evidence: iteration 2 has stronger marks but PromoCard remains primarily dark-panel UI while Ticket / Receipt / Relic are not yet governed by one explicit material contract.
  - Impact: object semantics are visible, but not yet as tactile or memorable as the source direction.
  - Fix implemented in final pass:
    - PromoCard: durable credential, dark layered surface, clay/gold light, restrained linear texture
    - Ticket: warm sand paper + tear/perforation logic
    - Receipt: thermal/lined paper + mono proof data + Proof mark
    - Relic: dark/violet retained object + Kept mark
    - PromoKey: compact dark access object

## What iteration 2 proved

The selected direction works.

PROMORANG now has a recognizable grammar across:
- P identity anchor
- movement / return language
- Tracks
- object system
- earth / signal palette
- Today / Discover consumer surfaces

The remaining issue is discipline, not direction selection.

## Final discipline pass

Implemented in `PromorangBrandGrammarFinal.tsx` and governed by `docs/design/promorang-brand-grammar-v2.md`.

Changes:
1. Five unique semantic marks.
2. One-major-brand-gesture-per-viewport rule.
3. Kingston-specific World photography.
4. Stronger material differentiation.
5. Utility icons remain conventional; proprietary marks are reserved for brand meaning.
6. Motion grammar is locked as:

```text
MOVE → EXPLORE → RETURN → PROOF → KEPT
```

7. Brand marks must communicate product state / consequence, not decoration.

## Required fidelity surfaces

### Fonts / typography
Fraunces editorial + sans utility remains strong. Production body / metadata must stay above the accessibility floor established in the consumer maturity spec.

### Spacing / layout rhythm
Iteration 2 is strong. Final pass reduces brand clutter rather than changing the underlying mature consumer hierarchy.

### Colors / tokens
Obsidian / Clay / Ochre / Sand / Gold / Water / Leaf remain approved. Clay / Sand / Gold are used to prevent black + orange from carrying the entire identity.

### Image quality / asset fidelity
Iteration 2 resolved the generic-icon fidelity problem. Final pass replaces contradictory world media with Kingston-specific placeholder photography and treats media truth as a production rule.

### Copy / content
Movement / return language is now concise enough to support the visual grammar. Production still requires real data for ratings, availability, verified uses, proximity, and recommendation provenance.

## Comparison history

### Iteration 1 — blocked
Major P1/P2 brand-asset mismatch.

### Iteration 2 — blocked, but direction validated
Identity became recognizable. Remaining blockers: mark differentiation, arc repetition, wrong-city imagery, object material discipline.

### Iteration 3 — implementation complete, render pending
Final discipline pass addresses all remaining iteration-2 P1/P2 findings at source level.

## Remaining verification

A local screenshot of **section 11 · PROMORANG brand grammar · final discipline pass** is required to verify:
1. Five marks are visually distinguishable without labels.
2. Today / Discover feel less branded-on-top than iteration 2.
3. Kingston World imagery renders correctly.
4. PromoCard texture remains subtle and legible.
5. Ticket / Receipt / Relic / PromoKey read as different materials.
6. PromoCard state progression still works.
7. Browser console has no new runtime errors.

If section 11 introduces no new P0/P1/P2 issues, final result can move to `passed` with only P3 polish remaining.

final result: blocked
