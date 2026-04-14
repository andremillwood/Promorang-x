---
name: promorang-content
description: Auto-generate moment recaps, social media posts, blog articles, and host spotlights from platform data.
---

# Promorang Content Engine Skill

Generates content assets from live platform data — no hallucination, everything data-driven.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Generate Moment Recap
Creates a post-moment summary with stats, top UGC, and highlights.
```bash
node ~/openclaw/skills/promorang-content/content.js --action moment-recap --moment-id <uuid>
```
Returns: formatted recap with title, date, stats (check-ins, UGC uploads, shares), and suggested social caption.

### Draft Social Post
Generates a ready-to-post social media caption for a moment.
```bash
node ~/openclaw/skills/promorang-content/content.js --action social-post --moment-id <uuid> --platform instagram|twitter|facebook
```

### Weekly Roundup
Generates "This Week on Promorang" content from the last 7 days of platform data.
```bash
node ~/openclaw/skills/promorang-content/content.js --action weekly-roundup
```

### Host Spotlight
Generates a feature piece on the top-performing host for the period.
```bash
node ~/openclaw/skills/promorang-content/content.js --action host-spotlight [--period 30d]
```

### Upcoming Moments Hype
Generates a "what's coming" preview post from upcoming moments.
```bash
node ~/openclaw/skills/promorang-content/content.js --action upcoming-hype [--city Kingston] [--days 7]
```

### Blog Article Draft
Generates a full SEO blog article from platform data.
```bash
node ~/openclaw/skills/promorang-content/content.js --action blog-draft --topic "top-moments-this-week"
```

## Notes
- All content is DATA-DRIVEN — stats come from the database, not invented
- Social posts include suggested hashtags and @mentions
- All drafts require Andre's approval before publishing
- The ops agent (Pulse) runs weekly-roundup and host-spotlight on cron
- The advisor agent (Rang) generates recaps when hosts ask
