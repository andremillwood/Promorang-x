---
name: promorang-analytics
description: Platform-level analytics, financial reporting, health monitoring, and trend detection for Promorang ops.
---

# Promorang Analytics Skill

Comprehensive platform intelligence for the ops agent (Pulse). Runs on cron schedules.

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key

## Available Actions

### Daily Health Check
Quick platform health assessment.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action health-check
```
Returns: active moments, new signups, error count, engagement rate.

### Weekly Trend Report
Detects growth/decline trends across metrics.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action weekly-trends
```

### Monthly Financial Report
Revenue, commission, and ROI analysis.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action monthly-financials [--month 2026-02]
```

### Churn Alert
Identifies users at risk of churning.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action churn-alert [--threshold 14]
```

### Growth Metrics
Overall platform growth dashboard.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action growth-metrics [--period 30d]
```

### Category Insights
Which moment categories are trending up/down.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action category-insights [--period 30d]
```

### Geographic Insights
Which cities/areas are most active.
```bash
node ~/openclaw/skills/promorang-analytics/analytics.js --action geo-insights
```

## Notes
- Daily health check runs at 8am via cron, sends to Telegram
- Weekly trends run Monday morning
- Monthly financials auto-generated on the 1st
- Churn alerts trigger re-engagement campaigns via the community skill
- All reports sent to Andre's private Telegram ops channel
