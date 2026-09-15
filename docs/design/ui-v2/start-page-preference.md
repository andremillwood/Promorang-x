# Start-page preference — Phase 0 implementation

The V2 foundation includes a conservative first implementation of the previously requested user-selectable start page.

## Current behavior

Post-login precedence is:

1. explicit requested/deep-linked destination;
2. saved valid start page for the active user + role on the current device;
3. existing role default.

The preference is editable in the existing Appearance/Preferences UI.

The option list is an allowlist by role. Arbitrary URLs and cross-role destinations are rejected rather than stored.

## Persistence scope

The Phase 0 implementation is deliberately **device-local** using `localStorage`, namespaced by user ID and role.

This avoids bundling a new database/RLS migration into the visual-foundation PR and makes the routing behavior testable without changing shared backend contracts.

It is not yet a cross-device/account-synced preference.

## Account-synced follow-up

Before promoting this preference to server persistence:

1. define a workspace-preference schema rather than a single unscoped user route;
2. establish workspace identity (role + org/client context);
3. add RLS that lets a user read/write only their own workspace preferences;
4. update generated Supabase types;
5. add query/mutation hooks;
6. migrate valid device-local values when appropriate;
7. retain the route allowlist on both read and write paths;
8. test deep-link precedence, onboarding precedence, role switching and stale/removed routes.

## Security/product rule

A stored preference is never navigation authority by itself. It must validate against the currently supported destinations for the active role/workspace before use.
