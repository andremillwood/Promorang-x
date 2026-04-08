-- =====================================================
-- WEEK 3: CONTRIBUTION VISIBILITY - DAILY STATE UPDATE
-- Adds weighted_gems_earned to daily_state for ranking
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_state') THEN
        -- Weighted gems earned today
        ALTER TABLE public.daily_state 
        ADD COLUMN IF NOT EXISTS weighted_gems_earned DECIMAL(12,2) DEFAULT 0;
        
        -- Create index for ranking
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'daily_state' AND indexname = 'idx_daily_state_weighted_gems') THEN
            CREATE INDEX idx_daily_state_weighted_gems 
            ON public.daily_state(state_date, weighted_gems_earned DESC);
        END IF;
    END IF;
END $$;
