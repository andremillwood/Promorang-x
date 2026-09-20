# PROMORANG Operator Shell + Role Switching v1

## Purpose

Preserve PROMORANG identity, mode context and operating identity on every stakeholder route, including deep canonical-object routes.

A specialized surface must not become a standalone mini-app simply because its workflow is deep.

## Product hierarchy

```text
PROMORANG
├─ Participant experience
└─ Operator experience
   ├─ Creator
   ├─ Host
   ├─ Merchant / Venue
   ├─ Brand
   ├─ Agency
   └─ Admin
```

Participant is not a seventh operator role. Moving between Participant and Operator is a deliberate **mode transition**.

## Persistent operator shell

Every operator route should preserve:

1. PROMORANG brand identity
2. current mode: Operator
3. current role
4. role switching
5. current workspace identity
6. role-native local navigation

Deep object pages may change the work surface, but not erase these levels of context.

## Switching semantics

### Mode switch

Participant ↔ Operator

This changes the user's mode of existence in PROMORANG.

Participant is consumer-facing, emotional, cultural, spatial and collectible.
Operator is role-based, operational, stateful and evidence-heavy.

Do not place Participant beside Admin as though they are equivalent roles.

### Role switch

Creator ↔ Host ↔ Merchant / Venue ↔ Brand ↔ Agency ↔ Admin

This changes the operating identity.

When switching from a deep route, default safely to the destination role's `Today` unless an equivalent canonical-object lens has actually been implemented and verified.

Do not fabricate deep-route parity.

### Local workspace navigation

Role-native navigation changes the job within the same role.

Merchant example:

```text
Now | Offers | Validate | Orders | Places
```

This is not role switching.

## Deep-route rule

Bad:

```text
/merchant/commercial
→ standalone page
→ no PROMORANG mark
→ no role switcher
→ no workspace navigation
```

Required:

```text
PROMORANG operator shell
→ Merchant / Venue selected
→ Merchant workspace nav
→ commercial boundary surface
```

## Canonical object continuity

Canonical objects may be shared across roles, but the route should only preserve the exact object when the destination role has a real lens for it.

Example future behavior:

```text
Merchant PromoKey validation
→ switch to Brand
→ Brand PromoKey evidence lens
```

Only enable this once the Brand lens exists.

Until then:

```text
Merchant deep route
→ switch Brand
→ /brand/today
```

This preserves truth over convenience.

## Visual rule

The shell provides continuity. The work surface provides role personality.

Do not use the shared shell to homogenize:

- Creator — studio / field kit
- Host — backstage / live operations
- Merchant — counter / commercial instruments
- Brand — activation fieldbook
- Agency — client folio
- Admin — forensic archive

## Current implementation

Deep Merchant commercial review:

```text
/stakeholder-next.html#/merchant/commercial
```

Now includes:

- PROMORANG mark
- Operator mode chip
- persistent operator role switcher
- deliberate Participant mode exit
- Merchant workspace identity
- Merchant local navigation
- canonical commercial boundary surface

