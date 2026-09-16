# PROMORANG Stakeholder Ops Convergence v1

This branch contains the first controlled production convergence slice for stakeholder operations.

Scope is limited to Merchant validation and Host live-arrival/proof review. Main remains unchanged until this branch is reviewed.

## Merchant validation

The scanner must distinguish presented code, validated redemption and paid transaction evidence. A successful redemption proves the offer was used; it does not itself prove revenue.

## Host arrivals

The host surface must distinguish RSVP intent, verified arrival, walk-in and unresolved exception. Sample/demo people must not be presented as live production truth.

## Host proof review

Submitted evidence, approved participation and downstream reward release remain separate states. Pending evidence must never coexist with a blanket claim such as `100% Verified`.

## Cross-role consequence

Merchant/Host proof can update participant Proof, rewards, Brand/Agency evidence and Admin exceptions. UI language should describe the exact event recorded, not inferred business outcomes.
