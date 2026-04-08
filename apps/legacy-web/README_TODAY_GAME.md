# Today Game - House War Edition

This document describes the new "Today" page architecture, which transforms the daily dashboard into a living game state view driven by the **House War Meter** mechanic.

## Overview

Users immediately understand:
1. **What's happening in the world today?** → District + War Window + House Standings
2. **Where do I stand?** → Your House + Contribution + Rank
3. **What happens if I do nothing?** → Consequences text + Lock timer
4. **What's the smallest action that changes the outcome?** → Primary Quest

---

## Component Map

```
/apps/web/src/react-app/
├── components/today-game/
│   ├── index.ts              # Barrel export
│   ├── WorldHeader.tsx       # District, Season, Timer, Leader info
│   ├── HouseWarMeter.tsx     # Race bar visualization (primary visual)
│   ├── YourPosition.tsx      # User's house, contribution, flip estimate
│   ├── PrimaryQuestCard.tsx  # Main CTA with house impact
│   ├── BoostCard.tsx         # Active multiplier display
│   ├── RankCard.tsx          # Current rank + unlock preview
│   ├── TonightLootCard.tsx   # Draw entries + prizes
│   ├── LastNightRecap.tsx    # Yesterday's winner recap
│   ├── StandingsModal.tsx    # Full standings popup
│   └── HouseSelectionGate.tsx # Day 0 house selection
│
├── hooks/
│   └── useTodayGame.ts       # State management + polling
│
├── lib/
│   ├── mockTodayApi.ts       # Mock API endpoints
│   └── todayGameUtils.ts     # Computation utilities
│
├── types/
│   └── todayGame.ts          # TypeScript types
│
└── pages/
    ├── TodayGame.tsx         # New game page
    └── Today.tsx             # Legacy (at /today-legacy)
```

---

## API Endpoints

### GET `/api/today/state`

Returns the full game state for today.

```typescript
interface TodayGameState {
    date: string;           // YYYY-MM-DD
    timestamp: string;      // ISO datetime
    district: District;
    season: Season;
    warWindow: WarWindow;
    warScores: WarScore[];
    user: TodayUserState;
    crew?: Crew;
    primaryQuest: Quest | null;
    quests: Quest[];
    boost?: Boost;
    draw: Draw;
    lastNightRecap?: LastNightRecap;
}
```

### POST `/api/quest/complete`

Marks a quest as completed and updates scores.

```typescript
// Request
{ questId: string }

// Response
{
    success: boolean;
    updatedUser: TodayUserState;
    updatedWarScores: WarScore[];
    newDrawEntries: number;
}
```

### GET `/api/houses`

Returns house metadata (static).

```typescript
interface House {
    id: string;
    name: string;
    color: string;
    icon: string;
    motto: string;
}
```

---

## Computation Logic

### `flipEstimate`

Calculates how many quests needed to overtake the leader:

```typescript
const requiredPoints = (leaderScore - userHouseScore) + 1;
const perQuestPoints = primaryQuest.houseImpactPoints * (boost?.multiplier ?? 1);
const flipEstimate = Math.ceil(requiredPoints / perQuestPoints);
```

### `leadMargin`

```typescript
const leadMargin = topHouseScore - secondHouseScore;
```

### `inactivityConsequenceText`

Dynamic messaging based on game state:

| Condition | Message |
|-----------|---------|
| Leading with thin margin | "Lead is thin — don't sleep" |
| Leading comfortably | "Commanding lead — keep pushing" |
| Trailing, flip ≤ 2 | "2 quests could flip the lead" |
| Trailing, flip ≤ 5 | "5 quests to take the lead" |
| Default | "Lock tonight decides the District" |

---

## Switching from Mock to Real API

The mock API is in `/lib/mockTodayApi.ts`. To switch to real API:

1. Create real endpoints in the backend:
   - `GET /api/today/game-state`
   - `POST /api/quest/complete`
   - `GET /api/houses`

2. Update `useTodayGame.ts`:

```typescript
// Before (mock)
import { fetchTodayState, completeQuest } from '../lib/mockTodayApi';

// After (real)
import api from '../lib/api';

async function fetchTodayState(): Promise<TodayGameState> {
    return await api.get('/today/game-state');
}

async function completeQuest(questId: string) {
    return await api.post('/quest/complete', { questId });
}
```

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/today` | `TodayGame` | New House War experience |
| `/today-legacy` | `Today` | Original dashboard (rollback) |
| `/today/opportunity` | `TodayOpportunity` | Featured drop detail |

---

## Mobile Layout

The game view is mobile-first:

- Single column layout
- War Meter fixed near top
- Primary Quest as sticky CTA
- Cards as vertical stack

Components use responsive Tailwind classes (`sm:`, `md:`) for larger screens.

---

## Houses

Season 1 includes 4 houses:

| House | Color | Icon | Motto |
|-------|-------|------|-------|
| House Sauce | Orange | 🔥 | "Burn bright or fade away" |
| House Luna | Purple | 🌙 | "Rise in the dark" |
| House Tide | Cyan | 🌊 | "Flow, adapt, conquer" |
| House Stone | Lime | 🏔️ | "Unmoved, unbroken" |

---

## Acceptance Criteria

1. ✅ Above the fold shows: District, timer, war meter, current leader, margin
2. ✅ User sees computed line: "X quests could flip the lead"
3. ✅ Completing a quest visibly moves the war meter (optimistic update)
4. ✅ "Last night recap" exists and updates after lock
5. ✅ Works on mobile responsive web
6. ✅ No "demand engine" language in UI
