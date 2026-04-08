-- =============================================
-- CAMPAIGN BUNDLING: LINK EVENTS TO CAMPAIGNS
-- =============================================

DO $$ 
BEGIN
    -- Add campaign_id to events table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        ALTER TABLE public.events 
        ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.advertiser_campaigns(id) ON DELETE SET NULL;
        
        -- Create index for performance
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'events' AND indexname = 'idx_events_campaign_id') THEN
            CREATE INDEX idx_events_campaign_id ON public.events(campaign_id);
        END IF;
    END IF;
END $$;
