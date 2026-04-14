---
name: promorang-matchmaking
description: Suggest partnerships between hosts, merchants, and brands based on location, category, and engagement data.
---

# Promorang Matchmaking Skill

Analyze platform data to suggest valuable partnerships between stakeholders.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Suggest Venues for a Host
Find nearby merchant venues that could host a moment.
```bash
node ~/openclaw/skills/promorang-matchmaking/match.js --action venues-for-host --host-id <uuid> [--city <city>] [--radius 5km]
```

### Suggest Hosts for a Merchant
Find active hosts who might want to create moments at a merchant's venue.
```bash
node ~/openclaw/skills/promorang-matchmaking/match.js --action hosts-for-merchant --merchant-id <uuid>
```

### Suggest Sponsors for a Moment
Find brands whose campaigns align with a moment's category/audience.
```bash
node ~/openclaw/skills/promorang-matchmaking/match.js --action sponsors-for-moment --moment-id <uuid>
```

### Find Re-engagement Targets
Identify stakeholders who haven't been active recently.
```bash
node ~/openclaw/skills/promorang-matchmaking/match.js --action inactive-stakeholders [--days 30] [--type host|merchant|participant]
```

## Notes
- Results include a `match_score` (0-100) based on proximity, category overlap, and past engagement
- Use this skill proactively — the advisor agent should surface suggestions without being asked
- The ops agent uses `inactive-stakeholders` for re-engagement campaigns
