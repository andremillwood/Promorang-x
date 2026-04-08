-- Phase 33: Automated Workflows
-- Date: 2026-02-04
-- Purpose: Create notification system, email logging, and scheduled job infrastructure

-- ============================================================================
-- 1. Notification Preferences Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notification preferences
  email_low_stock BOOLEAN DEFAULT true,
  email_redemptions BOOLEAN DEFAULT true,
  email_payouts BOOLEAN DEFAULT true,
  email_budget_alerts BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT true,
  
  -- Digest frequency
  digest_frequency TEXT DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
ON notification_preferences(user_id);

COMMENT ON TABLE notification_preferences IS 'User preferences for email notifications and digest frequency';

-- ============================================================================
-- 2. Email Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Email details
  email_type TEXT NOT NULL, -- 'low_stock', 'redemption', 'payout', 'budget_alert', 'weekly_summary'
  recipient_email TEXT NOT NULL,
  subject TEXT,
  
  -- Template information
  template_id TEXT,
  template_data JSONB DEFAULT '{}',
  
  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at);

COMMENT ON TABLE email_logs IS 'Log of all emails sent by the system with delivery tracking';

-- ============================================================================
-- 3. Scheduled Jobs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Job identification
  job_name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL, -- 'payout', 'inventory_check', 'budget_alert', 'weekly_report'
  description TEXT,
  
  -- Schedule
  schedule TEXT NOT NULL, -- Cron expression
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Execution tracking
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_duration_ms INTEGER,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed')),
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_success_at TIMESTAMPTZ,
  
  -- Metadata
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at);

COMMENT ON TABLE scheduled_jobs IS 'Configuration and status tracking for scheduled background jobs';

-- ============================================================================
-- 4. Job Execution Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_execution_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
  
  -- Execution details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Results
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  execution_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_execution_log_job ON job_execution_log(job_id);
CREATE INDEX IF NOT EXISTS idx_job_execution_log_status ON job_execution_log(status);
CREATE INDEX IF NOT EXISTS idx_job_execution_log_started ON job_execution_log(started_at);

COMMENT ON TABLE job_execution_log IS 'Historical log of scheduled job executions';

-- ============================================================================
-- 5. Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_preferences_updated_at 
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at 
BEFORE UPDATE ON scheduled_jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================

-- Notification Preferences RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Email Logs RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs"
  ON email_logs FOR SELECT
  USING (user_id = auth.uid());

-- Scheduled Jobs RLS (admin only)
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all scheduled jobs"
  ON scheduled_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Job Execution Log RLS (admin only)
ALTER TABLE job_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all job execution logs"
  ON job_execution_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- 7. Seed Default Jobs
-- ============================================================================

INSERT INTO scheduled_jobs (job_name, job_type, description, schedule, config) VALUES
  ('weekly_payouts', 'payout', 'Process weekly payouts to hosts and merchants', '0 17 * * 5', '{"day": "friday", "hour": 17}'),
  ('daily_inventory_check', 'inventory_check', 'Check for low stock products and send alerts', '0 6 * * *', '{"threshold": 10}'),
  ('hourly_budget_alerts', 'budget_alert', 'Check campaign budgets and send alerts at 80% threshold', '0 * * * *', '{"threshold_percent": 80}'),
  ('weekly_performance_reports', 'weekly_report', 'Generate and send weekly performance summaries', '0 9 * * 1', '{"day": "monday", "hour": 9}')
ON CONFLICT (job_name) DO NOTHING;

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 33: Automated Workflows migration completed successfully';
  RAISE NOTICE 'Created notification_preferences table';
  RAISE NOTICE 'Created email_logs table';
  RAISE NOTICE 'Created scheduled_jobs table';
  RAISE NOTICE 'Created job_execution_log table';
  RAISE NOTICE 'Seeded 4 default scheduled jobs';
END $$;
