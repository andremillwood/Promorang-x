---
name: promorang-feedback
description: Collect post-moment surveys, track NPS scores, and monitor sentiment from stakeholders.
---

# Promorang Feedback Intelligence Skill

Collects and analyzes stakeholder feedback: post-moment surveys, NPS tracking, and sentiment.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Generate Survey Questions
Creates targeted survey questions for a completed moment.
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action survey-questions --moment-id <uuid>
```
Returns: 3 short questions tailored to the moment type. Rang sends these via WhatsApp 2 hours post-moment.

### Record Survey Response
Stores a participant's survey response.
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action record-response --moment-id <uuid> --user-id <uuid> --rating <1-5> --feedback "text"
```

### Generate Host Report
Aggregates survey responses into an actionable report for the host.
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action host-report --moment-id <uuid>
```

### Record NPS Score
Stores a user's NPS response (0-10 scale).
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action record-nps --user-id <uuid> --score <0-10>
```

### NPS Dashboard
Calculates current NPS score with segmentation.
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action nps-dashboard [--period 30d]
```

### Sentiment Summary
Analyzes recent feedback text for positive/negative themes.
```bash
node ~/openclaw/skills/promorang-feedback/feedback.js --action sentiment-summary [--period 7d]
```

## Notes
- Survey questions sent via Rang on WhatsApp, 2 hours after moment ends
- NPS survey sent monthly to all active users
- Negative sentiment flags trigger immediate alerts to Andre
- Host reports sent automatically after survey window closes (24 hours)
