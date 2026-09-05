# PROMORANG web

The active web client uses React, TypeScript, Vite and React Router. Run commands from the repository root:

```sh
npm run dev:web
npm run build
npm test --workspace apps/web
npm run lint
```

Configure `apps/web/.env.example` values locally. The API base comes from `VITE_API_URL`, defaulting to `https://api.promorang.co`. Database migrations are maintained in the root `supabase/migrations` directory. Web and backend deploy separately; a successful web build does not confirm backend or database readiness.

See the root [README](../../README.md) for setup and deployment, and the [platform audit](../../docs/platform-audit-2026-09-05.md) for current verification gaps.
