# Backend Services Guide

_Last updated: 2025-10-29_

## Folder Structure
```
backend/
  api/                 # Express routers (per feature)
  services/            # Business logic interacting with Supabase
  tests/               # Unit + integration tests
    unit/
    mocks/
```

## Principles
1. **Router thin, service thick**: Express routes validate inputs, call service functions, and marshal responses.
2. **Single responsibility**: Each service file maps to a domain area (e.g., `growthService.js`).
3. **Database access via Supabase client**: Import shared client from service file; avoid raw SQL outside migrations.
4. **Error normalization**: Throw `Error` with user-safe message; upstream middleware logs and formats response.
5. **Transactional integrity**: When multiple tables are touched, use Supabase transactions (via RPC or `pg` when necessary).

## Core Service: `growthService.js`
| Function | Purpose | Returns |
|----------|---------|---------|
| `getStakingChannels()` | Fetch active staking channels | `[{ id, name, apy, ... }]` |
| `getUserStakingPositions(userId)` | User's staking positions | `[{ positionId, status, ... }]` |
| `createStakingPosition(payload)` | Create staking position + ledger entry | `position` |
| `claimStakingRewards(positionId, userId)` | Release matured rewards | `{ success, rewards }` |
| `getFundingProjects(filters)` | List funding campaigns | `{ data, count }` |
| `createFundingProject(payload)` | Insert project row + ledger seed | `project` |
| `pledgeToProject(payload)` | Record pledge, update totals, ledger | `pledge` |
| `getShieldPolicies()` | List active shield plans | `policy[]` |
| `createShieldSubscription(payload)` | Start subscription & ledger entry | `subscription` |
| `getCreatorRewards(params)` | Fetch rewards by creator/period | `reward[]` |
| `getUserLedger(params)` | Paginated ledger entries | `{ data, count }` |

## Content Service (WIP)
- Uploads handled directly in `backend/api/content.js` via Supabase storage.
- TODO: extract to `contentService.js` once additional business logic (ledger sync, pricing bands) is implemented.
- Ensure both `content_items` (UUID) and `content_pieces` (legacy BIGSERIAL) tables stay in sync until migrations fully converge.
- Initial share mint writes to `content_share_positions` when creator UUID is available; mock auth skips mint to avoid FK violations.

## Consuming Services in Routes
```js
// backend/api/growth.js
router.get('/staking/channels', async (req, res, next) => {
  try {
    const channels = await getStakingChannels();
    res.json({ data: channels });
  } catch (error) {
    next(error);
  }
});
```

## Error Handling Pattern
```js
try {
  // ...
} catch (error) {
  console.error('context message', error);
  throw new Error('User friendly message');
}
```
Express error middleware (see `backend/app.js`) turns thrown errors into JSON responses (`status: 500` by default).

## Validation Pattern
- Use `zod` within routes or services.
- Example:
```js
const createStakingSchema = z.object({
  channelId: z.string().uuid(),
  amount: z.number().positive(),
  durationDays: z.number().int().min(7)
});

const input = createStakingSchema.parse(req.body);
```
Handle `ZodError` and return `400` with `error.details`.

## Testing Strategy
- **Unit tests:** `backend/tests/unit/growth.test.js` (Supertest + mocked Supabase).
- **Mocking:** Use `backend/tests/mocks/index.js` for shared factory data.
- **Coverage goals:** 80%+ for services touching financial logic.
- **Run command:** `cd backend && npm test`.

## Supabase Client Initialization
```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
```
Provide `.env` defaults with safe fallbacks for local dev. Do **not** commit real keys.

## TODOs
- [ ] Add circuit breaker/error retry around Supabase network failures.
- [ ] Extract ledger helpers into dedicated module.
- [ ] Introduce structured logging before GA.
