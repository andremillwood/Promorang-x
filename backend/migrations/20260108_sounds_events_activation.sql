-- Migration: Sounds & Event Tickets Activation System

-- 1. Sounds Table (Activation Units)
CREATE TABLE IF NOT EXISTS public.sounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    audio_url TEXT NOT NULL,
    waveform_data JSONB,
    duration INTEGER, -- in seconds
    usage_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Ticket Tiers (Definitions)
CREATE TABLE IF NOT EXISTS public.event_ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_gems INTEGER DEFAULT 0,
    price_gold INTEGER DEFAULT 0,
    max_quantity INTEGER,
    sold_quantity INTEGER DEFAULT 0,
    perks_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Tickets (User Instances)
CREATE TABLE IF NOT EXISTS public.event_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id UUID REFERENCES public.event_ticket_tiers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'expired')),
    activation_code VARCHAR(20) UNIQUE,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Extend Drops Table for Linkage
ALTER TABLE public.drops 
ADD COLUMN IF NOT EXISTS required_sound_id UUID REFERENCES public.sounds(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS required_ticket_tier_id UUID REFERENCES public.event_ticket_tiers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- 5. Helper function for Ticket activation
CREATE OR REPLACE FUNCTION public.activate_event_ticket(ticket_code TEXT, check_in_by UUID)
RETURNS JSONB AS $$
DECLARE
    v_ticket_id UUID;
    v_event_id UUID;
BEGIN
    SELECT et.id, ett.event_id INTO v_ticket_id, v_event_id
    FROM event_tickets et
    JOIN event_ticket_tiers ett ON et.tier_id = ett.id
    WHERE et.activation_code = ticket_code AND et.status = 'valid';

    IF v_ticket_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or already used ticket');
    END IF;

    UPDATE event_tickets 
    SET status = 'used', activated_at = NOW(), updated_at = NOW()
    WHERE id = v_ticket_id;

    -- Optional: Logic to automatically check-in user to event_rsvps if exists
    UPDATE event_rsvps
    SET checked_in_at = NOW(), checked_in_by = check_in_by
    WHERE event_id = v_event_id AND user_id = (SELECT user_id FROM event_tickets WHERE id = v_ticket_id);

    RETURN jsonb_build_object('success', true, 'ticket_id', v_ticket_id, 'event_id', v_event_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add triggers for updated_at
CREATE TRIGGER update_sounds_updated_at BEFORE UPDATE ON sounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_ticket_tiers_updated_at BEFORE UPDATE ON event_ticket_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_tickets_updated_at BEFORE UPDATE ON event_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY sounds_public_read ON sounds FOR SELECT USING (true);
CREATE POLICY event_ticket_tiers_public_read ON event_ticket_tiers FOR SELECT USING (true);
CREATE POLICY event_tickets_owner_read ON event_tickets FOR SELECT USING (user_id = (SELECT id FROM users WHERE mocha_user_id = auth.uid()::text));
