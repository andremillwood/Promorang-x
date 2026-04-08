-- =====================================================
-- DROP APPLICATIONS ENHANCEMENTS
-- Adds proof tracking and flexible metadata
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drop_applications') THEN
        ALTER TABLE public.drop_applications 
        ADD COLUMN IF NOT EXISTS proof_url TEXT,
        ADD COLUMN IF NOT EXISTS submission_text TEXT,
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        
        -- Sync legacy columns if they exist (optional but good for compatibility)
        -- COLUMNS DO NOT EXIST IN CURRENT SCHEMA
        -- UPDATE public.drop_applications SET proof_url = submission_url WHERE proof_url IS NULL AND submission_url IS NOT NULL;
        -- UPDATE public.drop_applications SET submission_text = submission_notes WHERE submission_text IS NULL AND submission_notes IS NOT NULL;
    END IF;
END $$;
