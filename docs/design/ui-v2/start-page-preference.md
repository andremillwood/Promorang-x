# Start-page preference — reconciled implementation

PROMORANG now uses one authoritative start-page preference model shared with the current journey-integrity work.

## Current behavior

Post-login precedence is:

1. explicit requested/deep-linked destination;
2. onboarding when still required;
3. saved valid account-level landing preference;
4. existing role default.

The preference is editable in Appearance/Preferences.

## Persistence scope

The preference is stored in Supabase Auth user metadata using:

- `preferred_landing_path`;
- `preferred_landing_role`.

This means the preference follows the signed-in account across browsers/devices instead of being tied to one browser's local storage.

## Validation

Saved destinations are not trusted as arbitrary navigation input. `landing-page-preference.ts` builds an allowlist from the account's currently assigned roles and accepts only a matching internal destination.

Role-specific studio destinations are shown only when the account still has the corresponding role. Stale, cross-role or arbitrary external values fall back to the current role default.

## Workspace-role rule

`participant` is the universal fallback role, not the preferred workspace merely because it appears first in `user_roles`. When an account has a specific commercial role and no saved valid preference, the workspace resolver may prefer that specific role.

Organization membership is also reconciled to canonical `brand`, `merchant` and `agency` workspace roles by the associated database migration.

## Product rule

A stored preference never overrides explicit intent. Deep links, interrupted claim flows, RSVP/card intent and similar requested destinations remain authoritative.
