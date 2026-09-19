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

## Decision

Do not run `npm audit fix --force`. The suggested remediation includes multiple framework and tooling major upgrades. Each group needs its own compatibility pass and validation surface.
