# PROMORANG Stakeholder Resilience & Ops v1

## Purpose

This document combines the Design Lab resilience contract with the first production convergence slice.

A stakeholder workflow is production-ready only when it survives real operating conditions: mobile pressure, stale/offline data, permission limits, exceptions, recovery, and downstream cross-role consequences.

## Resilience requirements

- Mobile and desktop are job-specific, not scaled copies.
- Irreversible writes must not occur from stale or unconfirmed state without an explicit recovery policy.
- Offline mode must preserve last confirmed truth and label any local intent separately.
- View-only roles must not receive write affordances.
- Focus states, semantic status/alert regions, non-color cues and minimum 44px targets are required.
- Reduced-motion users must still understand every state transition.

## First production convergence slice

### Merchant validation

The Merchant scanner must distinguish:

`Presented code → Validated redemption → Transaction evidence`

A validated redemption proves that the offer was used. It does not, by itself, prove revenue.

The surface must expose pending writes, failures/conflicts, last confirmed redemption, and recovery.

### Host arrivals

The Host operating surface must distinguish:

`RSVP intent → Verified arrival → Walk-in → Exception → Proof close`

No sample/demo attendee data should appear as live operational truth.

### Host proof review

Submitted evidence must remain distinct from approved participation and reward release.

The surface must not present a blanket `100% Verified` state while evidence is pending.

## Cross-role consequence

Merchant/Host proof can update participant Proof, rewards, Brand/Agency evidence and Admin exceptions. UI language must describe the exact event recorded, not an inferred business outcome.
