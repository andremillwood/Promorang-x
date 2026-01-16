-- PromoShare Schema
-- Lottery system with 4 concurrent draw types: daily, weekly, monthly, grand

-- PROMOSHARE CYCLES (Draw periods)
CREATE TABLE IF NOT EXISTS public.promoshare_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_type TEXT NOT NULL CHECK (cycle_type IN ('daily', 'weekly', 'monthly', 'grand')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_at TIMESTAMPTZ NOT NULL,
    jackpot_amount NUMERIC DEFAULT 0,
    is_rollover BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding active cycles
CREATE INDEX IF NOT EXISTS idx_promoshare_cycles_active 
ON public.promoshare_cycles(status, cycle_type, start_at, end_at);

-- PROMOSHARE TICKETS (User entries)
CREATE TABLE IF NOT EXISTS public.promoshare_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    source_action TEXT NOT NULL,
    source_id TEXT,
    multiplier NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ticket queries
CREATE INDEX IF NOT EXISTS idx_promoshare_tickets_cycle ON public.promoshare_tickets(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_tickets_user ON public.promoshare_tickets(user_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_tickets_number ON public.promoshare_tickets(cycle_id, ticket_number);

-- Prevent duplicate tickets for same action
CREATE UNIQUE INDEX IF NOT EXISTS idx_promoshare_tickets_unique_action 
ON public.promoshare_tickets(user_id, cycle_id, source_action, source_id) 
WHERE source_id IS NOT NULL;

-- PROMOSHARE POOL ITEMS (Prizes in each draw)
CREATE TABLE IF NOT EXISTS public.promoshare_pool_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('gem', 'key', 'point', 'coupon', 'product', 'other')),
    amount NUMERIC NOT NULL,
    description TEXT,
    image_url TEXT,
    sponsor_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_pool_items_cycle ON public.promoshare_pool_items(cycle_id);

-- PROMOSHARE WINNERS (Draw results)
CREATE TABLE IF NOT EXISTS public.promoshare_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    winning_ticket_id UUID REFERENCES public.promoshare_tickets(id),
    prize_description TEXT,
    prize_data JSONB,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_winners_cycle ON public.promoshare_winners(cycle_id);
CREATE INDEX IF NOT EXISTS idx_promoshare_winners_user ON public.promoshare_winners(user_id);

-- PROMOSHARE SPONSORSHIPS (Advertiser contributions)
CREATE TABLE IF NOT EXISTS public.promoshare_sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_sponsorships_cycle ON public.promoshare_sponsorships(cycle_id);

-- SEED INITIAL CYCLES (All 4 draw types)
-- Daily Draw - ends at midnight tonight
INSERT INTO public.promoshare_cycles (cycle_type, status, start_at, end_at, jackpot_amount, is_rollover)
VALUES (
    'daily',
    'active',
    DATE_TRUNC('day', NOW()),
    DATE_TRUNC('day', NOW()) + INTERVAL '1 day',
    50,
    FALSE
) ON CONFLICT DO NOTHING;

-- Weekly Draw - ends next Sunday
INSERT INTO public.promoshare_cycles (cycle_type, status, start_at, end_at, jackpot_amount, is_rollover)
VALUES (
    'weekly',
    'active',
    DATE_TRUNC('week', NOW()),
    DATE_TRUNC('week', NOW()) + INTERVAL '1 week',
    500,
    FALSE
) ON CONFLICT DO NOTHING;

-- Monthly Draw - ends on 1st of next month
INSERT INTO public.promoshare_cycles (cycle_type, status, start_at, end_at, jackpot_amount, is_rollover)
VALUES (
    'monthly',
    'active',
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    2500,
    FALSE
) ON CONFLICT DO NOTHING;

-- Grand Jackpot Draw - weekly but separate, rolls over
INSERT INTO public.promoshare_cycles (cycle_type, status, start_at, end_at, jackpot_amount, is_rollover)
VALUES (
    'grand',
    'active',
    DATE_TRUNC('week', NOW()),
    DATE_TRUNC('week', NOW()) + INTERVAL '1 week',
    10000,
    TRUE
) ON CONFLICT DO NOTHING;

-- Add pool items for each cycle
INSERT INTO public.promoshare_pool_items (cycle_id, reward_type, amount, description)
SELECT id, 'gem', 50, 'Daily Gem Prize'
FROM public.promoshare_cycles WHERE cycle_type = 'daily' AND status = 'active'
LIMIT 1;

INSERT INTO public.promoshare_pool_items (cycle_id, reward_type, amount, description)
SELECT id, 'gem', 500, 'Weekly Jackpot'
FROM public.promoshare_cycles WHERE cycle_type = 'weekly' AND status = 'active'
LIMIT 1;

INSERT INTO public.promoshare_pool_items (cycle_id, reward_type, amount, description)
SELECT id, 'gem', 2500, 'Monthly Grand Prize'
FROM public.promoshare_cycles WHERE cycle_type = 'monthly' AND status = 'active'
LIMIT 1;

INSERT INTO public.promoshare_pool_items (cycle_id, reward_type, amount, description)
SELECT id, 'gem', 10000, 'GRAND JACKPOT - Rolls over until won!'
FROM public.promoshare_cycles WHERE cycle_type = 'grand' AND status = 'active'
LIMIT 1;

-- Enable RLS
ALTER TABLE public.promoshare_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_pool_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_sponsorships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Cycles: Anyone can read active cycles
CREATE POLICY "Anyone can view active cycles" ON public.promoshare_cycles
    FOR SELECT USING (status = 'active');

-- Tickets: Users can see their own tickets
CREATE POLICY "Users can view own tickets" ON public.promoshare_tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Pool items: Anyone can view
CREATE POLICY "Anyone can view pool items" ON public.promoshare_pool_items
    FOR SELECT USING (true);

-- Winners: Anyone can view (for transparency)
CREATE POLICY "Anyone can view winners" ON public.promoshare_winners
    FOR SELECT USING (true);

-- Sponsorships: Advertisers can view their own
CREATE POLICY "Advertisers can view own sponsorships" ON public.promoshare_sponsorships
    FOR SELECT USING (auth.uid() = advertiser_id);
