# Frontend Architecture

_Last updated: 2025-10-29_

## Stack Overview
- **Framework:** React 18 with functional components and hooks.
- **Bundler:** Vite (ESM, HMR, environment variables prefixed with `VITE_`).
- **Routing:** React Router v7 (`frontend/src/react-app/routes`).
- **State/Data:** Component-level state + custom hooks; leverage Supabase Auth helpers for session handling.
- **Styling:** Tailwind-style utility classes and scoped CSS modules (see `frontend/src/react-app/styles`).
- **Testing:** Vitest + React Testing Library (`npm run test`).

## Directory Layout
```
frontend/src/react-app/
  components/           # Reusable UI pieces
  pages/                # Route-level components
  services/             # API clients (e.g., growthHubService.ts)
  hooks/                # Custom hooks (auth, data fetching)
  store/                # Global context if needed (lightweight)
  utils/                # Helpers (formatting, constants)
  tests/                # Component/integration tests
```

## Growth Hub Data Flow
1. UI component triggers action (e.g., StakingPage → `useStaking` hook).
2. Hook calls `growthHubService` method (REST via Axios/fetch).
3. Service hits backend `/api/growth/*` endpoint.
4. Response normalized and stored in component state/query cache.

## Coding Conventions
- Keep components focused: extract subcomponents once component >200 LOC.
- Name hooks with `use*` prefix; co-locate with consuming component when specific.
- Prefer `async/await`; handle errors with `try/catch` and surface user-friendly toasts.
- Use TypeScript types from `/frontend/src/react-app/types/growthHub.ts` (add missing ones as needed).

## Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```
Access via `import.meta.env.VITE_*`.

## Testing Checklist
- Unit tests for complex components (stateful forms, calculations).
- Integration tests simulating user flows (staking, pledging, rewards claim).
- Run `npm run test -- --watch` during dev; ensure CI uses `npm run test -- --runInBand`.

## Performance Considerations
- Lazy-load heavy modules (analytics dashboards, charts).
- Memoize derived data with `useMemo/useCallback` when props are stable.
- Debounce user inputs for search/filter.
- Monitor bundle size (Vite `npm run build -- --analyze`).

## Pending Enhancements
- [ ] Introduce React Query for data caching.
- [ ] Add skeleton loaders while fetching Growth Hub data.
- [ ] Consolidate toast/notification utility.

## Related Docs
- `docs/growth-hub-overview.md`
- `docs/frontend/growth-hub-ui.md`
- `docs/backend/services.md`
