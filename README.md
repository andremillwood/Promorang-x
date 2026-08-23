# Promorang

Promorang is a multi-surface platform for Moments, verified participation, merchant commerce, sponsorship, rewards, and reusable outcome records.

> 📜 **Guiding Product Constitution**: All architecture, UX, and copy decisions must strictly adhere to the [Product Ethos & Human UX Constitution](docs/PRODUCT_ETHOS_AND_HUMAN_UX.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Primary React 18 + TypeScript + Vite web application |
| `apps/mobile` | Expo / React Native application for iOS and Android |
| `backend` | Express API and Vercel serverless functions |
| `packages/shared` | Shared domain types and business rules |
| `supabase/migrations` | Canonical Supabase database migrations |
| `docs` | Product, operations, economy, and release documentation |
| `src/react-app` | Legacy application surface retained during migration |
| `apps/legacy-web` | Legacy static web snapshot |

The active web application is `apps/web`; there is no active `/frontend` directory.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project for authenticated/data-backed flows
- Expo and EAS access for native builds
- Vercel access for production deployment

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Local development

Copy the relevant example environment files and fill in local values:

- `apps/web/.env.example`
- `apps/mobile/.env.example`
- `backend/.env.example`

Never place service-role keys, signing credentials, or other secrets in an `EXPO_PUBLIC_*` variable.

```bash
# Web
npm run dev:web

# Mobile
npm run dev:mobile

# Backend
npm run dev --workspace backend
```

The production API is expected at `https://api.promorang.co`; the public web application is expected at `https://promorang.co`.

## Validation

```bash
npm run build
npm run lint
npm run test:shared
npm test --workspace backend
npm run release:check --workspace apps/mobile
```

The mobile release check validates native configuration, TypeScript, and independent iOS and Android production exports. It intentionally fails while required account-owned values such as the EAS project ID are missing.

## Deployment

Web and backend are separate Vercel deployments:

```bash
npm run deploy:web
npm run deploy:backend
```

Database changes in `supabase/migrations` must be applied to the intended Supabase environment before deploying code that depends on them. Do not assume a successful frontend build means the production database is current.

Native builds are created from `apps/mobile` with EAS. Follow:

- [Mobile store release checklist](docs/mobile-store-release-checklist.md)
- [Mobile account configuration](docs/mobile-account-configuration.md)
- [Mobile payments policy](docs/mobile-payments-policy.md)
- [Store listing copy and evidence](docs/mobile-store-listing.md)

## Production services

- Supabase: authentication, database, and storage
- Vercel: web and API hosting
- Expo/EAS: native builds, signing, submission, and push credentials
- Stripe: eligible physical goods, real-world services, and event-access payments
- Apple and Google: native authentication and store distribution

Authentication, API integration, and database-backed flows are implemented. Production readiness depends on applying migrations, supplying environment-specific credentials, configuring provider consoles, and completing release QA—not replacing mock functions across the application.

## Security

- Keep `.env` files and signing credentials out of Git.
- Use the Supabase anon key in clients and the service-role key only on the backend.
- Keep production demo login disabled.
- Treat payment webhooks as the authority for completed payments and fulfillment.
- Review dependency audit results before each native submission.
