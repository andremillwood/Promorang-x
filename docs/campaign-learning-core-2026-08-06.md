# Campaign learning core

Promorang campaign learning turns verified demand history into reusable structure and evidence-backed recommendations. It does not create a universal opportunity score and does not automatically change live campaigns.

## Reusable patterns

A saved pattern keeps the campaign's goal, experience type, action structure, selected distribution systems, value-system roles, return mechanics and measurement contract. It intentionally removes dates, locations, audience assumptions, reward amounts and performance claims. Those must be decided again for each campaign.

## Recommendation rules

The first learning engine is deterministic and inspectable:

- Missing discovery evidence → fix instrumentation before optimizing.
- Discovery without interest → clarify the invitation before buying more reach.
- Interest without participation → reduce access, timing, location or proof friction.
- Participation without verified conversion → realign action, proof and participant value.
- Conversion without review → request neutral reflection after fulfillment.
- Conversion without return → design a relevant next invitation.
- Performance materially below the merchant's same-goal median → compare audience, timing, action and proof.

Confidence is based on the denominator behind the recommendation: fewer than 10 people is insufficient, 10–29 low, 30–99 medium and 100+ high.

## Safety boundaries

- Recommendations are proposed, accepted, rejected or applied explicitly.
- The learning service stores the evidence snapshot behind every recommendation.
- Same-goal merchant history is preferred over category-wide assumptions.
- Templates never copy performance as a promise.
- AI can later explain or draft variants from this evidence, but it must not invent evidence or silently launch changes.

## Required migration

Apply `202608060005_campaign_learning_core.sql` after the demand-event network migration.
