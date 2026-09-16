# PROMORANG Stakeholder Ops Convergence v1

This document defines the first production convergence slice for stakeholder workflows.

## Scope

Only Merchant validation and Host live-arrival/proof review are in scope.

Existing production routes remain intact. Work happens on `design/stakeholder-ops-convergence-v1` until reviewed.

## Merchant validation contract

The merchant scanner must:
- make the current venue/station explicit;
- distinguish presented code, validated redemption and paid transaction;
- preserve the last confirmed redemption receipt;
- show pending network/write state clearly;
- expose recovery after failed or duplicate/conflicting redemption;
- use a minimum 44px action target and visible keyboard focus;
- never claim revenue unless transaction evidence exists.

## Host arrival contract

The host live surface must:
- remove fabricated `vibe level` style metrics from the operational truth surface;
- distinguish RSVP intent from verified arrival and walk-in attendance;
- make freshness/sync state explicit;
- prioritize door operation on mobile;
- preserve exceptions rather than silently upgrading them to verified attendance;
- avoid sample people being presented as live production truth.

## Host proof-review contract

The proof-review surface must:
- distinguish submitted evidence from approved participation;
- avoid a blanket `100% Verified` metric when pending evidence exists;
- make approval consequence explicit;
- include reject/review-later states before production approval is irreversible;
- make proof source, timestamp and reward consequence visible;
- preserve accessibility and focus behavior.

## Cross-role consequence

A merchant/host proof action is not local-only. It can affect participant Proof, rewards, brand/agency evidence and admin exceptions. UI language should therefore describe the exact event recorded rather than an inferred business outcome.
