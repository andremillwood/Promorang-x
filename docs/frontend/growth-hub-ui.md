# Growth Hub UI Guide

_Last updated: 2025-10-29_

## Route Map
| Route | Component | Purpose |
|-------|-----------|---------|
| `/growth-hub` | `GrowthHubDashboard` | Overview cards, quick actions |
| `/growth-hub/staking` | `StakingPage` | List channels, manage positions |
| `/growth-hub/funding` | `FundingPage` | Browse projects, launch project |
| `/growth-hub/shield` | `ShieldPage` | Policy catalog, subscriptions |
| `/growth-hub/rewards` | `CreatorRewardsPage` | Reward history, claim status |
| `/growth-hub/ledger` | `LedgerPage` | Filterable transaction log (admin) |

## Component Responsibilities
- **Dashboard widgets** in `components/growthHub/cards/*` consume hooks for summary data.
- **Tables & Lists** use `DataTable` component with column configs per feature.
- **Forms** rely on `react-hook-form` + `zodResolver` for validation, located in `components/forms/*`.
- **Charts** (APY trends, pledge progress) powered by Recharts.

## Hooks & Services
| Hook | Source | Description |
|------|--------|-------------|
| `useStaking()` | `hooks/useStaking.ts` | Fetch channels, create/claim positions |
| `useFunding()` | `hooks/useFunding.ts` | Fetch projects, create project, pledge |
| `useShield()` | `hooks/useShield.ts` | Fetch policies, manage subscriptions |
| `useCreatorRewards()` | `hooks/useCreatorRewards.ts` | Fetch rewards, trigger recalculation |
| `useLedger()` | `hooks/useLedger.ts` | Paginated ledger entries, filters |

All hooks delegate to `growthHubService.ts` which wraps `fetchJSON` utility and attaches JWT.

## UI States & UX Guidelines
- **Loading**: Show skeletons (see `components/skeletons`) and disable primary actions.
- **Empty states**: Provide call-to-action (e.g., "Launch your first project").
- **Errors**: Display inline alert + retry button; log details via `useErrorLogger`.
- **Success feedback**: Use global toast system (`useToast`) with success variant.
- **Accessibility**: Ensure buttons have `aria-label`, tables use semantic markup.

## Styling
- Utility classes defined in `styles/tokens.css` for spacing/colors.
- Dark mode supported; respect CSS variables `--color-*`.
- Keep forms responsive (stack inputs on <768px width).

## Testing Checklist
- Snapshot tests for static components (`cards`, `empty states`).
- Interaction tests for forms (submit success/error).
- Route integration tests to verify redirects and guard logic (auth/role checks).

## Pending Tasks
- [ ] Implement admin ledger filters (date range, type).
- [ ] Add tooltips explaining APY calculations.
- [ ] Connect notifications for staking maturity reminders.

## Reference
- `docs/growth-hub-overview.md`
- `docs/frontend/architecture.md`
- Figma designs: _link TBD_
