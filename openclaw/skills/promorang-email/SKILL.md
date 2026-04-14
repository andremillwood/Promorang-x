---
name: promorang-email
description: Send transactional emails via Resend API — outreach, surveys, digests, and notifications.
---

# Promorang Email Skill (Resend)

Send emails through Resend for outreach, surveys, digests, and notifications.

## Environment Variables Required

- `RESEND_API_KEY` — Resend API key

## Available Actions

### Send Email
```bash
node ~/openclaw/skills/promorang-email/email.js --action send \
  --to "owner@venue.com" \
  --subject "Your event has fans on Promorang" \
  --body "plain text body" \
  [--from "Promorang <hello@promorang.co>"]
```

### Send Claim Outreach
Pre-built "Claim Your Moment" email for unclaimed moments.
```bash
node ~/openclaw/skills/promorang-email/email.js --action claim-outreach --moment-id <uuid> --to "owner@email.com"
```

### Send Survey
Post-moment feedback survey email.
```bash
node ~/openclaw/skills/promorang-email/email.js --action survey --moment-id <uuid> --to "participant@email.com"
```

### Send Weekly Digest
Stakeholder digest with recent stats and highlights.
```bash
node ~/openclaw/skills/promorang-email/email.js --action digest --user-id <uuid>
```

### Send NPS Survey
Monthly NPS check-in.
```bash
node ~/openclaw/skills/promorang-email/email.js --action nps --to "user@email.com" --user-id <uuid>
```

## Notes
- All emails require Andre's approval before first send of a new template
- Default from address: `Promorang <hello@promorang.co>`
- Resend tracks opens/clicks/bounces automatically
- Never send more than 50 emails per batch without approval
