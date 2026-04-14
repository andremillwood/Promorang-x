#!/bin/bash
# ============================================
# Promorang OpenClaw Cron Jobs
# ============================================
# Install on the VPS by adding to crontab:
#   crontab -e
#   Then paste the schedule below
#
# All jobs log to the OpenClaw cron system and
# send notifications to the Telegram ops channel.
# ============================================

# ── DAILY ───────────────────────────────────

# 6:00 AM — Event scraping pipeline
# Scrapes Eventbrite for Jamaica events, creates unclaimed moments
0 6 * * * cd ~/openclaw && node skills/promorang-claim/claim.js --action create-unclaimed --source eventbrite >> /var/log/openclaw/scrape.log 2>&1

# 8:00 AM — Daily health check
# Reports platform health to Telegram
0 8 * * * cd ~/openclaw && node skills/promorang-analytics/analytics.js --action health-check >> /var/log/openclaw/health.log 2>&1

# 9:00 AM — Daily challenge
# Posts a random engagement challenge
0 9 * * * cd ~/openclaw && node skills/promorang-community/community.js --action daily-challenge >> /var/log/openclaw/challenge.log 2>&1

# ── WEEKLY ──────────────────────────────────

# Monday 8:00 AM — Weekly trends report
0 8 * * 1 cd ~/openclaw && node skills/promorang-analytics/analytics.js --action weekly-trends >> /var/log/openclaw/trends.log 2>&1

# Monday 9:00 AM — Weekly roundup content
0 9 * * 1 cd ~/openclaw && node skills/promorang-content/content.js --action weekly-roundup >> /var/log/openclaw/roundup.log 2>&1

# Monday 10:00 AM — Upcoming moments hype
0 10 * * 1 cd ~/openclaw && node skills/promorang-content/content.js --action upcoming-hype --days 7 >> /var/log/openclaw/hype.log 2>&1

# Wednesday 8:00 AM — Churn alert check
0 8 * * 3 cd ~/openclaw && node skills/promorang-analytics/analytics.js --action churn-alert --threshold 14 >> /var/log/openclaw/churn.log 2>&1

# Friday 8:00 AM — Leaderboard (participants)
0 8 * * 5 cd ~/openclaw && node skills/promorang-community/community.js --action leaderboard --type participants --period 7d >> /var/log/openclaw/leaderboard.log 2>&1

# Friday 9:00 AM — Leaderboard (hosts)
0 9 * * 5 cd ~/openclaw && node skills/promorang-community/community.js --action leaderboard --type hosts --period 7d >> /var/log/openclaw/leaderboard.log 2>&1

# ── MONTHLY ─────────────────────────────────

# 1st of month, 8:00 AM — Monthly awards
0 8 1 * * cd ~/openclaw && node skills/promorang-community/community.js --action monthly-awards >> /var/log/openclaw/awards.log 2>&1

# 1st of month, 9:00 AM — Host spotlight
0 9 1 * * cd ~/openclaw && node skills/promorang-content/content.js --action host-spotlight --period 30d >> /var/log/openclaw/spotlight.log 2>&1

# 1st of month, 10:00 AM — Growth metrics
0 10 1 * * cd ~/openclaw && node skills/promorang-analytics/analytics.js --action growth-metrics --period 30d >> /var/log/openclaw/growth.log 2>&1

# 1st of month, 11:00 AM — Geographic insights
0 11 1 * * cd ~/openclaw && node skills/promorang-analytics/analytics.js --action geo-insights >> /var/log/openclaw/geo.log 2>&1

# 15th of month, 8:00 AM — NPS survey trigger
0 8 15 * * cd ~/openclaw && echo "Trigger NPS survey via Rang WhatsApp" >> /var/log/openclaw/nps.log 2>&1

# ── SETUP ───────────────────────────────────
# Create log directory on first install:
#   sudo mkdir -p /var/log/openclaw
#   sudo chown $USER:$USER /var/log/openclaw
