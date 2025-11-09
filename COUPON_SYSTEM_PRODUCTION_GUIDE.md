# Coupon System - Production Implementation Guide

## Overview
Complete production-ready coupon reward system with automated assignments, email notifications, bulk management, and analytics.

---

## 🚀 Quick Start

### 1. Database Setup
Run migrations in order:
```bash
# Core user coupon system
supabase migration up 202511090001_user_coupons.sql

# Automated cron jobs
supabase migration up 202511090002_coupon_cron_jobs.sql

# Content engagement tracking
supabase migration up 202511090003_content_engagement_coupons.sql

# Email notification queue
supabase migration up 202511090004_email_notifications.sql
```

### 2. Environment Variables
Add to `.env`:
```bash
# Email Configuration (required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@promorang.co

# Frontend URL for email links
FRONTEND_URL=https://promorang.co
```

### 3. Start Email Processor
```bash
# Run as background service
cd backend
node workers/emailProcessor.js

# Or with PM2
pm2 start workers/emailProcessor.js --name coupon-emails
```

---

## 📋 Features Implemented

### ✅ 1. Automated Cron Jobs (`202511090002_coupon_cron_jobs.sql`)

**Scheduled Tasks:**
- **Weekly Leaderboard** (Mondays 00:00 UTC): Top 10 users
- **Monthly Leaderboard** (1st of month 00:00 UTC): Top 25 users
- **Daily Top Performers** (Daily 23:00 UTC): Top 5 users
- **Cleanup Expired** (Daily 02:00 UTC): Mark expired coupons
- **Update Status** (Hourly): Auto-expire and archive coupons

**Monitoring:**
- Logs stored in `coupon_cron_logs` table
- Track success/failure rates
- Monitor assignment counts

**Manual Trigger:**
```sql
-- Assign leaderboard coupons manually
SELECT assign_leaderboard_coupons_with_logging('weekly', 10);
```

---

### ✅ 2. Content Engagement Tracking (`202511090003_content_engagement_coupons.sql`)

**How It Works:**
1. User interacts with sponsored content (view, like, share, comment, click)
2. Event tracked in `content_engagement_events` table
3. Trigger checks if engagement meets coupon conditions
4. Auto-assigns coupon to user if qualified
5. Notification sent to user

**Backend Endpoint:**
```javascript
POST /api/content/:contentId/engage
{
  "event_type": "like",  // view, like, share, comment, click
  "metadata": {}
}
```

**Frontend Integration:**
```typescript
// Track engagement when user likes content
await api.post(`/api/content/${contentId}/engage`, {
  event_type: 'like'
});
```

**Advertiser Setup:**
1. Create coupon with conditions:
```json
{
  "required_events": ["like", "share"],
  "min_engagement_count": 2
}
```
2. Assign to content via `CouponManager`
3. System auto-assigns when user meets criteria

---

### ✅ 3. Email Notifications (`202511090004_email_notifications.sql`)

**Email Types:**
- **Coupon Earned**: Sent immediately when user earns a coupon
- **Expiry Warning**: Sent 3 days before coupon expires
- **Weekly Digest**: Summary of earned/available/expiring coupons

**Email Queue System:**
- Emails queued in `email_notification_queue` table
- Background worker processes queue every 30 seconds
- Automatic retry (up to 3 attempts) on failure
- Status tracking: pending → sent/failed

**Email Templates:**
- Beautiful HTML emails with gradients
- Responsive design
- Direct links to rewards page
- Personalized content

**Monitoring:**
```sql
-- Check email queue status
SELECT status, COUNT(*) 
FROM email_notification_queue 
GROUP BY status;

-- View failed emails
SELECT * FROM email_notification_queue 
WHERE status = 'failed';
```

---

### ✅ 4. Bulk Coupon Creation (`/advertiser/coupons/bulk`)

**Features:**
- Create multiple coupons at once
- CSV import/export
- Duplicate existing coupons
- Template download
- Batch validation
- Progress tracking

**CSV Format:**
```csv
Title,Description,Reward Type,Value,Value Unit,Quantity,Start Date,End Date
25% Off Premium,Discount on premium subscription,coupon,25,percentage,100,2025-01-01,2025-12-31
100 Bonus Gems,Free gems reward,credit,100,gems,50,2025-01-01,2025-06-30
```

**Usage:**
1. Navigate to `/advertiser/coupons`
2. Click "Bulk Create"
3. Add coupons manually or import CSV
4. Review and create all at once

---

### ✅ 5. Analytics Dashboard (`/advertiser/coupons/analytics`)

**Metrics Tracked:**
- Total coupons created
- Total assignments
- Total redemptions
- Redemption rate %
- Total value distributed

**Visualizations:**
- Top performing coupons (by redemption rate)
- Assignments by source (drop/leaderboard/content)
- Redemptions over time (chart)
- AI-powered insights and recommendations

**Export:**
- Download CSV reports
- Time range filters (7d, 30d, 90d, all time)

---

## 🔄 User Flow

### For Regular Users:

1. **Earn Coupons:**
   - Complete drops → Auto-assigned via trigger
   - Engage with content → Auto-assigned when threshold met
   - Rank on leaderboard → Assigned via cron job

2. **Discover Coupons:**
   - Home feed "Rewards" tab
   - Mixed in "For You" feed (every 5 items)
   - Drop detail page banners
   - Email notifications

3. **Track Rewards:**
   - `/rewards` hub page
   - Stats dashboard
   - Filter available vs redeemed
   - Expiry warnings

4. **Redeem:**
   - One-click redemption
   - Instant code generation (coupons)
   - Auto-credit account (gems/keys)
   - Toast notifications

### For Advertisers:

1. **Create Coupons:**
   - Single creation via `CouponManager`
   - Bulk creation via `/advertiser/coupons/bulk`
   - CSV import for scale

2. **Assign to Triggers:**
   - Attach to drops
   - Assign to leaderboard positions
   - Link to sponsored content

3. **Monitor Performance:**
   - Analytics dashboard
   - Real-time stats
   - Export reports
   - AI insights

---

## 📊 Database Schema

### Key Tables:

**`advertiser_coupon_assignments`** (Extended)
```sql
- user_id: UUID (user who earned it)
- drop_id: UUID (if from drop)
- content_id: UUID (if from content)
- leaderboard_rank: INT (if from leaderboard)
- is_redeemed: BOOLEAN
- redeemed_at: TIMESTAMP
- metadata: JSONB
```

**`content_engagement_events`**
```sql
- user_id: UUID
- content_id: UUID
- event_type: TEXT (view/like/share/comment/click)
- metadata: JSONB
- created_at: TIMESTAMP
```

**`email_notification_queue`**
```sql
- user_id: UUID
- email_type: TEXT
- recipient_email: TEXT
- template_data: JSONB
- status: TEXT (pending/sent/failed)
- retry_count: INT
```

**`coupon_cron_logs`**
```sql
- job_name: TEXT
- executed_at: TIMESTAMP
- coupons_assigned: INT
- success: BOOLEAN
- error_message: TEXT
```

---

## 🔧 API Endpoints

### User Endpoints:
```
GET  /api/rewards/coupons              # List user's coupons
GET  /api/rewards/coupons/:id          # Get coupon details
POST /api/rewards/coupons/:id/redeem   # Redeem coupon
GET  /api/rewards/stats                # User reward stats
```

### Advertiser Endpoints:
```
GET  /api/advertisers/coupons          # List all coupons
POST /api/advertisers/coupons          # Create coupon
POST /api/advertisers/coupons/:id/assign  # Assign to target
```

### Content Engagement:
```
POST /api/content/:id/engage           # Track engagement
```

---

## 🎯 Testing Checklist

### Drop Completion Flow:
- [ ] Create coupon
- [ ] Assign to drop via `CouponManager`
- [ ] User completes drop
- [ ] Coupon auto-assigned to user
- [ ] Email notification sent
- [ ] Appears in user's rewards hub
- [ ] User can redeem successfully

### Leaderboard Flow:
- [ ] Create coupon
- [ ] Assign to leaderboard position
- [ ] Wait for cron job (or trigger manually)
- [ ] Top users receive coupons
- [ ] Email notifications sent
- [ ] Check `coupon_cron_logs` for success

### Content Engagement Flow:
- [ ] Create coupon with engagement conditions
- [ ] Assign to content
- [ ] User engages (like/share)
- [ ] Coupon auto-assigned when threshold met
- [ ] Notification sent
- [ ] Verify in `content_engagement_events`

### Email System:
- [ ] Check `email_notification_queue` has pending emails
- [ ] Email processor running
- [ ] Emails sent successfully
- [ ] Failed emails retried
- [ ] Status updated correctly

### Bulk Creation:
- [ ] Import CSV with 10+ coupons
- [ ] All coupons created successfully
- [ ] Navigate to coupons list
- [ ] Verify all appear correctly

### Analytics:
- [ ] View analytics dashboard
- [ ] Metrics display correctly
- [ ] Charts render properly
- [ ] Export CSV works
- [ ] Time range filters work

---

## 🐛 Troubleshooting

### Coupons Not Auto-Assigning:
1. Check trigger is enabled:
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_assign_drop_coupons';
```
2. Verify coupon is active and has quantity
3. Check assignment template exists (user_id IS NULL)

### Emails Not Sending:
1. Verify email processor is running: `pm2 status`
2. Check SMTP credentials in `.env`
3. View queue: `SELECT * FROM email_notification_queue WHERE status = 'pending'`
4. Check error messages in failed emails

### Cron Jobs Not Running:
1. Verify pg_cron extension enabled
2. Check scheduled jobs:
```sql
SELECT * FROM cron.job;
```
3. View cron logs:
```sql
SELECT * FROM coupon_cron_logs ORDER BY executed_at DESC;
```

### Engagement Not Tracking:
1. Verify trigger exists on `content_engagement_events`
2. Check coupon conditions are valid JSON
3. Ensure content_id matches in assignment

---

## 📈 Performance Optimization

### Indexes Created:
- `idx_advertiser_coupon_assignments_user` (user_id, is_redeemed, status)
- `idx_content_engagement_user` (user_id, content_id, event_type)
- `idx_email_queue_status` (status, created_at)

### Recommended Monitoring:
```sql
-- Slow queries
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%coupon%' 
ORDER BY mean_exec_time DESC;

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE tablename LIKE '%coupon%';
```

---

## 🔐 Security Considerations

1. **User Isolation**: All queries filter by authenticated user_id
2. **Rate Limiting**: Consider adding to engagement endpoint
3. **Email Validation**: Verify email addresses before queuing
4. **SQL Injection**: All queries use parameterized statements
5. **CORS**: Configured in backend for allowed origins

---

## 📝 Future Enhancements

1. **A/B Testing**: Test different coupon values/types
2. **Personalization**: ML-based coupon recommendations
3. **Referral Rewards**: Coupons for referring friends
4. **Tiered Rewards**: Progressive rewards for loyal users
5. **Social Sharing**: Bonus coupons for sharing on social media
6. **Push Notifications**: Mobile app notifications
7. **Advanced Analytics**: Cohort analysis, LTV tracking
8. **Fraud Detection**: Detect and prevent coupon abuse

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review database logs: `coupon_cron_logs`, `email_notification_queue`
3. Monitor application logs for errors
4. Check Supabase dashboard for query performance

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
