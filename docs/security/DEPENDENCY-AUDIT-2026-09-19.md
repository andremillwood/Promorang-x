# Dependency audit triage — 2026-09-19

## Scope

Audit run from the repository root with npm 10.9.3 and Node 22.19.0 after regenerating a valid lockfile.

## Current result

| Scope | Low | Moderate | High | Critical | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| All dependencies | 9 | 38 | 42 | 2 | 91 |
| Production only (`--omit=dev`) | 7 | 25 | 20 | 0 | 52 |

The two critical findings are development/tooling paths, not production runtime dependencies:

- `vitest` is direct and requires a coordinated Vitest/Vite major-version upgrade to fully clear the current advisories.
- `tar` is transitive through `@vercel/fun`; it should be cleared by upgrading the Vercel CLI/tooling chain rather than forcing a nested package override without compatibility testing.

## Priority order

1. Patch direct production dependencies with compatible releases: `@hono/node-server`, `axios`, Express 4, Hono, and Resend.
2. Test the React Router upgrade separately because the currently reported fix crosses the application router's major-version boundary.
3. Upgrade Vitest together with Vite and rerun the complete web suite; Vitest 4.1.11 requires Vite 6 or newer.
4. Upgrade Expo as its own mobile migration. npm's proposed fixes move the application from Expo 54 to Expo 57 and must not be applied as a blind audit fix.
5. Upgrade Vercel CLI/tooling separately to clear the transitive `tar`, `undici`, and builder findings.

## Runtime exposure map

- Express is the primary backend router and is imported broadly across the API. Its compatible 4.x patch is the highest-priority production update.
- Axios is used for outbound profile/oEmbed verification in `scoutService` and AI verification calls. Treat its SSRF/proxy advisories as production-relevant.
- Resend is the active email transport for account, referral, RSVP, campaign, payout and support messages. Upgrade it with the email service test group.
- `@hono/node-server` and `hono` are declared by the backend package but are not imported anywhere in backend source. Remove those declarations during the next lockfile regeneration rather than upgrading unused runtime code.
- React Router is central to the web application and therefore requires a dedicated migration rather than an audit-driven major bump.

An offline uninstall of the unused Hono declarations was attempted, but npm could not regenerate the workspace lockfiles because unrelated package metadata was not present in the local cache. No manifest-only edit was left behind.

## Decision

Do not run `npm audit fix --force`. The suggested remediation includes multiple framework and tooling major upgrades. Each group needs its own compatibility pass and validation surface.
