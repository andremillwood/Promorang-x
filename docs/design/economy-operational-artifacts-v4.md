# PROMORANG Economy Operational Artifacts v4

## Purpose

V1 established semantics. V2 separated subsystem personalities. V3 established materials and believable object construction. V4 makes those objects operationally credible by showing the records, serials, timestamps, custody, validation, transfer, draw-lock and settlement evidence that make each object trustworthy in use.

## Governing rule

> Every visible detail should identify, authenticate, locate, quantify, time, authorize, record or transform the object.

Operational density is not decoration. It is evidence.

## Discovery

Discovery must show actual demand formation inputs and responses:
- signal count
- location
- velocity
- threshold
- host/merchant/creator responses
- supply commitment state
- activation state

A signal does not become a Moment until supply actually commits.

## Pieces

A Piece must carry:
- Piece / edition ID
- acquisition type
- origin
- proof class
- utility
- collection
- holder state
- transfer residue
- provenance events

Ownership may change. Provenance must not.

## PromoKeys

A PromoKey must carry:
- Key ID
- issuer
- venue / place
- unlock requirement
- validity
- redemption requirement
- live state
- validation residue after use

After validation, the Key stops behaving as usable access and becomes Proof.

## PromoShare

Each PromoShare draw must carry:
- named draw ID
- prize
- close time
- ticket batch
- ticket provenance
- lock event
- draw timestamp
- immutable result
- claim state

Tickets never migrate silently between named draws.

## Save & Win

The UI must prove separation of:
- participant available Gems
- participant parked principal
- ticket allocation
- named draw
- committed promotional prize
- prize funding source

Principal must never visually merge with prize.

## Value objects

### Gems
Use transactional ledgers: source, destination, amount, timestamp and context.

### Points
Use participation traces: reason, action, progression/eligibility context and history.

### Tickets
Use named-draw entry objects: draw name, quantity/serial/batch, source, close state and result.

## Production gate

Before promotion into Participant Next or production:
- map each visible field to real data
- map every state to a real record or event
- add loading / empty / error / expired / revoked states
- remove review-only values and timestamps
- preserve audit, provenance and attribution integrity
- confirm mobile and desktop density separately
