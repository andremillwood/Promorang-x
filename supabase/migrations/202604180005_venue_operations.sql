-- Venue Operations Schema
-- Perk redemption lifecycle and venue operational tracking

-- Perk redemption lifecycle tracking
CREATE TABLE IF NOT EXISTS public.perk_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Perk and memory references
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  perk_id uuid NOT NULL REFERENCES public.memory_perks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Venue context
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  
  -- Redemption lifecycle
  status text NOT NULL DEFAULT 'issued' CHECK (status IN (
    'issued',        -- Perk created with memory, not yet available
    'available',     -- Eligible to redeem (e.g., after check-in)
    'reserved',      -- User has reserved/claimed intent
    'pending_proof', -- Awaiting verification at venue
    'redeemed',      -- Successfully redeemed at venue
    'expired',       -- Past expiration date
    'revoked',       -- Cancelled by host/venue
    'transferred'    -- Transferred to another user
  )),
  
  -- Timeline tracking
  issued_at timestamptz NOT NULL DEFAULT now(),
  available_at timestamptz,
  reserved_at timestamptz,
  redeemed_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  
  -- Redemption details
  redemption_method text CHECK (redemption_method IN ('qr_code', 'nfc_tap', 'manual_code', 'staff_override')),
  redemption_code text,
  redemption_venue_staff_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Benefit claimed
  benefit_claimed jsonb NOT NULL DEFAULT '{}'::jsonb,
  benefit_value_at_redemption numeric(12,4),
  
  -- Transfer tracking (if transferable)
  original_memory_id uuid REFERENCES public.memories(id) ON DELETE SET NULL,
  transferred_from_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  transferred_at timestamptz,
  
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Perk reservation queue (for limited inventory perks)
CREATE TABLE IF NOT EXISTS public.perk_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id uuid NOT NULL REFERENCES public.perk_redemptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  
  -- Reservation details
  reservation_status text NOT NULL DEFAULT 'pending' CHECK (reservation_status IN (
    'pending',   -- Awaiting venue confirmation
    'confirmed', -- Venue confirmed reservation
    'declined',  -- Venue declined/capacity
    'completed', -- User redeemed
    'expired',   -- No-show
    'cancelled'  -- User cancelled
  )),
  
  reserved_for_date date,
  reserved_for_time_start timestamptz,
  reserved_for_time_end timestamptz,
  party_size integer DEFAULT 1,
  
  -- Staff handling
  handled_by_staff_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  staff_notes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (redemption_id, reserved_for_date)
);

-- Venue staff assignments for perk management
CREATE TABLE IF NOT EXISTS public.venue_staff_perk_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  role text NOT NULL DEFAULT 'verifier' CHECK (role IN (
    'verifier',    -- Can verify/scan redemptions
    'manager',     -- Can manage inventory and settings
    'admin'        -- Full perk management access
  )),
  
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  
  UNIQUE (venue_id, user_id)
);

-- Venue perk inventory (for perks with limited availability)
CREATE TABLE IF NOT EXISTS public.venue_perk_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  perk_id uuid NOT NULL REFERENCES public.memory_perks(id) ON DELETE CASCADE,
  
  -- Inventory tracking
  total_quantity integer,
  reserved_quantity integer NOT NULL DEFAULT 0,
  redeemed_quantity integer NOT NULL DEFAULT 0,
  
  -- Daily/hourly limits
  max_per_day integer,
  max_per_hour integer,
  
  -- Availability windows
  available_days integer[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday
  available_time_start time,
  available_time_end time,
  blackout_dates date[],
  
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (venue_id, perk_id)
);

-- Perk redemption analytics (aggregated for venue insights)
CREATE TABLE IF NOT EXISTS public.venue_perk_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  perk_id uuid NOT NULL REFERENCES public.memory_perks(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Daily metrics
  issued_count integer NOT NULL DEFAULT 0,
  available_count integer NOT NULL DEFAULT 0,
  reserved_count integer NOT NULL DEFAULT 0,
  redeemed_count integer NOT NULL DEFAULT 0,
  expired_count integer NOT NULL DEFAULT 0,
  
  -- Timing metrics
  avg_time_to_redeem interval, -- From available to redeemed
  avg_reservation_lead_time interval, -- From reserve to redemption
  
  -- Revenue/value tracking
  total_benefit_value numeric(12,4) NOT NULL DEFAULT 0.0000,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, perk_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_user ON public.perk_redemptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_venue ON public.perk_redemptions(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_memory ON public.perk_redemptions(memory_id);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_status ON public.perk_redemptions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_perk_redemptions_code ON public.perk_redemptions(redemption_code) 
  WHERE redemption_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_perk_reservations_venue ON public.perk_reservations(venue_id, reservation_status);
CREATE INDEX IF NOT EXISTS idx_perk_reservations_date ON public.perk_reservations(reserved_for_date);

CREATE INDEX IF NOT EXISTS idx_venue_staff_perk_roles ON public.venue_staff_perk_roles(venue_id, user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_venue_perk_inventory ON public.venue_perk_inventory(venue_id, perk_id, is_active);

CREATE INDEX IF NOT EXISTS idx_venue_perk_analytics ON public.venue_perk_analytics(venue_id, date DESC);

-- RLS Policies
ALTER TABLE public.perk_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perk_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_staff_perk_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_perk_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_perk_analytics ENABLE ROW LEVEL SECURITY;

-- Users can see their own redemptions
CREATE POLICY "Perk redemptions readable by owner"
  ON public.perk_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Venue staff can see redemptions at their venue
CREATE POLICY "Perk redemptions readable by venue staff"
  ON public.perk_redemptions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venue_staff_perk_roles
      WHERE venue_id = perk_redemptions.venue_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Venue staff can update redemptions at their venue
CREATE POLICY "Perk redemptions updatable by venue staff"
  ON public.perk_redemptions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venue_staff_perk_roles
      WHERE venue_id = perk_redemptions.venue_id
        AND user_id = auth.uid()
        AND is_active = true
        AND role IN ('manager', 'admin', 'verifier')
    )
  );

-- Reservations policies
CREATE POLICY "Perk reservations readable by user"
  ON public.perk_reservations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Perk reservations readable by venue staff"
  ON public.perk_reservations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venue_staff_perk_roles
      WHERE venue_id = perk_reservations.venue_id
        AND user_id = auth.uid()
        AND is_active = true
    )
  );

-- Staff roles
CREATE POLICY "Venue staff roles readable by venue staff"
  ON public.venue_staff_perk_roles FOR SELECT TO authenticated
  USING (
    venue_id IN (
      SELECT venue_id FROM public.venue_staff_perk_roles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Functions

-- Create perk redemption from memory issuance
CREATE OR REPLACE FUNCTION public.create_perk_redemption(
  p_memory_id uuid,
  p_perk_id uuid,
  p_user_id uuid,
  p_venue_id uuid DEFAULT NULL,
  p_moment_id uuid DEFAULT NULL
)
RETURNS public.perk_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption public.perk_redemptions;
  v_perk public.memory_perks;
  v_code text;
BEGIN
  -- Get perk details
  SELECT * INTO v_perk
  FROM public.memory_perks
  WHERE id = p_perk_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perk not found: %', p_perk_id;
  END IF;
  
  -- Generate unique redemption code
  v_code := upper(substring(md5(random()::text), 1, 8));
  
  -- Create redemption record
  INSERT INTO public.perk_redemptions (
    memory_id, perk_id, user_id, venue_id, moment_id,
    status, redemption_code, expires_at
  ) VALUES (
    p_memory_id, p_perk_id, p_user_id, p_venue_id, p_moment_id,
    'issued',
    v_code,
    COALESCE(v_perk.expires_at, now() + interval '90 days')
  )
  RETURNING * INTO v_redemption;
  
  RETURN v_redemption;
END;
$$;

-- Mark perk as available (e.g., after check-in verified)
CREATE OR REPLACE FUNCTION public.activate_perk_redemption(
  p_redemption_id uuid,
  p_available_at timestamptz DEFAULT now()
)
RETURNS public.perk_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption public.perk_redemptions;
BEGIN
  UPDATE public.perk_redemptions
  SET status = 'available',
      available_at = p_available_at,
      updated_at = now()
  WHERE id = p_redemption_id
    AND status = 'issued'
  RETURNING * INTO v_redemption;
  
  RETURN v_redemption;
END;
$$;

-- Reserve a perk (user claims intent)
CREATE OR REPLACE FUNCTION public.reserve_perk_redemption(
  p_redemption_id uuid,
  p_venue_id uuid,
  p_reserved_for_date date DEFAULT CURRENT_DATE,
  p_party_size integer DEFAULT 1
)
RETURNS public.perk_reservations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation public.perk_reservations;
  v_redemption public.perk_redemptions;
  v_user_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Verify redemption ownership and status
  SELECT * INTO v_redemption
  FROM public.perk_redemptions
  WHERE id = p_redemption_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption not found or not owned by user';
  END IF;
  
  IF v_redemption.status NOT IN ('available', 'issued') THEN
    RAISE EXCEPTION 'Perk is not available for reservation. Status: %', v_redemption.status;
  END IF;
  
  -- Update redemption status
  UPDATE public.perk_redemptions
  SET status = 'reserved',
      reserved_at = now(),
      updated_at = now()
  WHERE id = p_redemption_id;
  
  -- Create reservation
  INSERT INTO public.perk_reservations (
    redemption_id, user_id, venue_id,
    reservation_status, reserved_for_date, party_size
  ) VALUES (
    p_redemption_id, v_user_id, p_venue_id,
    'pending', p_reserved_for_date, p_party_size
  )
  RETURNING * INTO v_reservation;
  
  RETURN v_reservation;
END;
$$;

-- Redeem a perk at venue (staff verification)
CREATE OR REPLACE FUNCTION public.redeem_perk(
  p_redemption_code text,
  p_venue_id uuid,
  p_redemption_method text DEFAULT 'qr_code',
  p_benefit_claimed jsonb DEFAULT '{}'::jsonb
)
RETURNS public.perk_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption public.perk_redemptions;
  v_staff_id uuid;
BEGIN
  v_staff_id := auth.uid();
  
  -- Verify staff has access to this venue
  IF NOT EXISTS (
    SELECT 1 FROM public.venue_staff_perk_roles
    WHERE venue_id = p_venue_id
      AND user_id = v_staff_id
      AND is_active = true
      AND role IN ('verifier', 'manager', 'admin')
  ) THEN
    RAISE EXCEPTION 'Staff member not authorized for this venue';
  END IF;
  
  -- Find and update redemption
  UPDATE public.perk_redemptions
  SET status = 'redeemed',
      redeemed_at = now(),
      redemption_method = p_redemption_method,
      redemption_venue_staff_id = v_staff_id,
      benefit_claimed = p_benefit_claimed,
      benefit_value_at_redemption = (
        SELECT (benefit_value->>'value')::numeric 
        FROM public.memory_perks 
        WHERE id = perk_redemptions.perk_id
      ),
      updated_at = now()
  WHERE redemption_code = upper(p_redemption_code)
    AND venue_id = p_venue_id
    AND status IN ('available', 'reserved', 'pending_proof')
  RETURNING * INTO v_redemption;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid redemption code or already redeemed';
  END IF;
  
  -- Update any related reservation
  UPDATE public.perk_reservations
  SET reservation_status = 'completed',
      updated_at = now()
  WHERE redemption_id = v_redemption.id;
  
  RETURN v_redemption;
END;
$$;

-- Get venue redemption summary for dashboard
CREATE OR REPLACE FUNCTION public.get_venue_redemption_summary(
  p_venue_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - 30,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  status text,
  count bigint,
  total_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.status,
    count(*)::bigint,
    COALESCE(sum(pr.benefit_value_at_redemption), 0)::numeric
  FROM public.perk_redemptions pr
  WHERE pr.venue_id = p_venue_id
    AND pr.created_at::date BETWEEN p_start_date AND p_end_date
  GROUP BY pr.status
  ORDER BY 
    CASE pr.status
      WHEN 'redeemed' THEN 1
      WHEN 'reserved' THEN 2
      WHEN 'available' THEN 3
      WHEN 'issued' THEN 4
      ELSE 5
    END;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_venue_perk_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perk_redemptions_timestamp
  BEFORE UPDATE ON public.perk_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_perk_timestamps();

CREATE TRIGGER update_perk_reservations_timestamp
  BEFORE UPDATE ON public.perk_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_perk_timestamps();

CREATE TRIGGER update_venue_staff_perk_roles_timestamp
  BEFORE UPDATE ON public.venue_staff_perk_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_perk_timestamps();

CREATE TRIGGER update_venue_perk_inventory_timestamp
  BEFORE UPDATE ON public.venue_perk_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_perk_timestamps();

CREATE TRIGGER update_venue_perk_analytics_timestamp
  BEFORE UPDATE ON public.venue_perk_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_perk_timestamps();

NOTIFY pgrst, 'reload schema';
