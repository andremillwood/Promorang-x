# PROMORANG — Consumer Maturity Rules v1

Status: **Design Lab reference**  
Applies first to: **Today / Discover / PromoCard**  
Production migration remains participant-scoped until merchant / creator / host workspaces receive their own canonical design.

## 1. Goal

PROMORANG should feel like a mature consumer product rather than a visually polished startup dashboard.

The maturity test is not “is this attractive?” It is whether the interface can quietly answer:

1. What is this?
2. Who is offering it?
3. Why is it relevant to me?
4. Can I trust it?
5. What do I get?
6. When / where can I use it?
7. What should I do next?

## 2. Editorial restraint

Fraunces is the editorial voice, not the default voice.

Rules:
- one major editorial statement may dominate a mobile viewport
- secondary opportunities use DM Sans or a materially quieter scale
- do not give every result a display headline
- utility, trust, metadata and terms should remain sans-serif
- avoid stacked large serif headings competing for attention

## 3. Discovery format diversity

Discover should not be a feed of one repeated card template.

Canonical content formats:
- hero opportunity — one dominant visual / editorial item
- compact opportunity row — image + merchant + outcome + metadata
- live signal — what is active now
- place / map doorway — geographic context
- social-context signal — saved / used / moving with people you know
- saved / expiring object — personal state
- merchant / issuer strip — trusted source context

The content determines the format. Do not force all opportunities into identical geometry.

## 4. Trust before action

For transactional or redeemable opportunities, show enough information to make the action credible before asking the user to act.

Preferred trust signals where available:
- issuer / merchant identity
- verified issuer state
- rating / review signal
- verified uses or redemptions
- location / distance
- availability or inventory
- time window / expiry
- remaining uses
- merchant-validation requirement
- booking / cancellation conditions where applicable

Do not fabricate any trust signal in production. Omit unavailable signals rather than displaying placeholders as facts.

## 5. Context and personalization

Personalization should be legible without becoming a dashboard.

Examples:
- Because you used two lunch benefits nearby
- Saved because you follow this Scene
- Three people you move with saved this
- 42 minutes left
- 0.7 km away
- Three slots left today

Context should answer “why this, why now?” quietly.

## 6. PromoCard credential maturity

PromoCard is an access credential, not a decorative offer card.

The front-face hierarchy should be capable of expressing:
- PROMORANG identity
- issuer identity
- verified issuer state
- status: ready / locked / used / expired / unavailable
- serial / credential reference
- primary benefit
- context / place
- validity window
- remaining uses where relevant
- holder
- Scene / affinity marks only when meaningful

The credential / QR remains a protected action state. Do not expose redemption mechanics just to make the front visually interesting.

## 7. Accessibility floor

Design Lab studies may explore editorial density, but production should not rely on ultra-small low-contrast metadata.

Minimum expectations:
- avoid essential copy below ~11px on mobile
- supporting text should retain usable contrast against imagery
- imagery must have sufficient overlay treatment for readable text
- icon-only controls require accessible labels
- color should not be the only carrier of state
- touch targets should remain at least 44px-equivalent where practical

Actual WCAG compliance requires implementation testing; these rules are only the visual floor.

## 8. Image system

Photography and video are product content, not decoration.

Production media should support:
- merchant / brand-owned photography
- product imagery
- place / venue imagery
- creator media
- short video
- user-generated media where permitted
- editorial crop controls
- fallback imagery

Stock photography is acceptable in the Design Lab to validate hierarchy. It must not be mistaken for merchant-owned production media.

## 9. Today maturity hierarchy

Preferred order:
1. current context — city / time / proximity
2. one major opportunity
3. issuer / merchant identity
4. value / benefit
5. trust + availability
6. one dominant action
7. quiet explanation of relevance
8. supporting timing / directions / terms

Today is not a feed and not a dashboard.

## 10. Discover maturity hierarchy

Preferred structure:
1. personalized context
2. one dominant hero opportunity
3. mixed-format secondary opportunities
4. nearby / map context
5. social / movement context where meaningful
6. live / saved / expiring state

Search and filters remain utility, not the visual identity of discovery.

## 11. Production convergence test

Before migrating a Design Lab pattern into production, verify:
- the pattern works with real data, including missing-data states
- no fabricated trust or personalization copy survives
- participant-only migration does not remove contributor / operator functionality
- loading / empty / error states are defined
- interactive semantics remain intact
- mobile readability is acceptable on a real device
- the same pattern works outside nightlife

## 12. Quality bar

The interface should feel closer to mature consumer platforms because it is:
- contextual rather than explanatory
- content-led rather than component-led
- trustworthy rather than merely premium
- varied rather than templated
- personal rather than dashboard-like
- restrained rather than decorated

The product should not need to announce “PROMORANG” in every module. The access, proof, context and action model should make it recognizable.