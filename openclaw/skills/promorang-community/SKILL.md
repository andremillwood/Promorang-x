---
name: promorang-community
description: Manage WhatsApp community groups, post leaderboards, announce awards, and drive real-time social proof.
---

# Promorang Community Skill

Drives community engagement through WhatsApp group management, leaderboards, live updates, and awards.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Generate Leaderboard
Generates a weekly leaderboard of top participants, hosts, or venues.
```bash
node ~/openclaw/skills/promorang-community/community.js --action leaderboard --type participants|hosts|venues [--period 7d] [--city Kingston]
```

### Generate Monthly Awards
Identifies winners across categories for the month.
```bash
node ~/openclaw/skills/promorang-community/community.js --action monthly-awards [--month 2026-02]
```
Categories: Most Active Host, Most Checked-In Venue, Top Participant, Most UGC Uploads, Rising Star.

### Live Moment Update
Generates a real-time update for an active moment (for posting to WhatsApp group).
```bash
node ~/openclaw/skills/promorang-community/community.js --action live-update --moment-id <uuid>
```

### Welcome New User
Generates a welcome message for a new signup (for WhatsApp group).
```bash
node ~/openclaw/skills/promorang-community/community.js --action welcome --user-id <uuid>
```

### Rank Up Announcement
Generates a celebration message when a user ranks up.
```bash
node ~/openclaw/skills/promorang-community/community.js --action rank-up --user-id <uuid> --new-rank <number>
```

### Daily Challenge
Generates a daily engagement challenge for the community.
```bash
node ~/openclaw/skills/promorang-community/community.js --action daily-challenge [--type check-in|ugc|referral]
```

## Notes
- Messages are formatted for WhatsApp (emoji-rich, concise)
- Rang posts these to city WhatsApp groups
- Monthly awards are also published to the Promorang social accounts
- Daily challenges rotate between check-in, UGC, and referral types
