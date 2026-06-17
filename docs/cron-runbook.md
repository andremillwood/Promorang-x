# Cron Runbook

## Production model

Production uses a single Vercel Hobby cron:

- `GET/POST /api/cron/daily`

That endpoint performs:

- email queue processing
- email campaign maintenance
- admin digest
- Daily Layer close + reset
- PromoShare maintenance

## Protected access

All `/api/cron/*` routes require `CRON_SECRET` in production.

Accepted formats:

- `x-cron-secret: <secret>`
- `Authorization: Bearer <secret>`
- `?secret=<secret>`

## Health check

```bash
curl "https://api.promorang.co/api/cron/health?secret=$CRON_SECRET"
```

## Manual production triggers

Run the full daily maintenance pass:

```bash
curl -X POST "https://api.promorang.co/api/cron/daily" \
  -H "x-cron-secret: $CRON_SECRET"
```

Trigger only Daily Layer reset:

```bash
curl -X POST "https://api.promorang.co/api/cron/daily-layer/reset" \
  -H "x-cron-secret: $CRON_SECRET"
```

Trigger only Daily Layer close:

```bash
curl -X POST "https://api.promorang.co/api/cron/daily-layer/close" \
  -H "x-cron-secret: $CRON_SECRET"
```

Trigger PromoShare maintenance:

```bash
curl -X POST "https://api.promorang.co/api/cron/promoshare/maintenance" \
  -H "x-cron-secret: $CRON_SECRET"
```

## Local long-running mode

Only local/dev long-running servers should use in-process schedulers.

Required env:

```env
ENABLE_CRON_JOBS=true
```

This starts:

- `backend/jobs/cron.js`
- `backend/jobs/emailScheduler.js`
- `backend/jobs/dailyLayerJob.js`
- `backend/jobs/promoShareScheduler.js`

Do not rely on those local schedulers in Vercel production.
