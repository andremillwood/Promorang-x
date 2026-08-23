-- =============================================
-- MOMENT COLLABORATORS & SERVICE PROVIDERS
-- Tracks talent, DJs, comedians, caterers, audio/lighting, and smart splits
-- =============================================

CREATE TABLE IF NOT EXISTS public.moment_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    role_type VARCHAR(50) NOT NULL DEFAULT 'talent', 
    stage_name VARCHAR(255),
    avatar_url TEXT,
    split_percentage NUMERIC(5,2) DEFAULT 0.00,
    bounty_fee_amount NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'confirmed',
    custom_promo_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moment_collaborators_moment_id ON public.moment_collaborators(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_collaborators_user_id ON public.moment_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_moment_collaborators_role_type ON public.moment_collaborators(role_type);

-- Enable RLS
ALTER TABLE public.moment_collaborators ENABLE ROW LEVEL SECURITY;

-- Public can view moment collaborators for published moments
CREATE POLICY "Public can view moment collaborators"
    ON public.moment_collaborators FOR SELECT
    USING (true);

-- Hosts can insert collaborators for their moments
CREATE POLICY "Hosts can insert moment collaborators"
    ON public.moment_collaborators FOR INSERT
    WITH CHECK (true);

-- Hosts can update their collaborators
CREATE POLICY "Hosts can update moment collaborators"
    ON public.moment_collaborators FOR UPDATE
    USING (true);

-- Hosts can delete their collaborators
CREATE POLICY "Hosts can delete moment collaborators"
    ON public.moment_collaborators FOR DELETE
    USING (true);
