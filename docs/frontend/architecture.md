# Frontend architecture

The active browser application is `apps/web/src`, not the legacy root `src/react-app` tree. It uses React 18, Vite and React Router 6, with TanStack Query, Supabase authentication, Tailwind and shadcn components.

- `main.tsx` starts the application; `App.tsx` registers routes.
- `contexts/AuthContext.tsx` supplies account/session context.
- `components/onboarding/PostLoginRouter.tsx` preserves requested destinations and handles onboarding.
- `services` and `hooks` connect views to the backend and database.
- `pages` contains route-level experiences; operational studio views remain available through the dashboard.

See the [web README](../../apps/web/README.md) for commands and the [platform audit](../platform-audit-2026-09-05.md) for current limitations. Client route protection improves the user experience; server authorization and database policies must independently enforce access.
