-- Anti-Fraud Proof Verification Stack
-- Multi-layer fraud detection for check-ins and redemptions

-- Fraud risk levels
CREATE TYPE public.fraud_risk_level AS ENUM ('none', 'low', 'medium', 'high', 'critical');

-- Device fingerprint tracking
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash text NOT NULL UNIQUE,
  
  -- Device characteristics (hashed/aggregated)
  user_agent_pattern text,
  screen_fingerprint text,
  timezone_offset integer,
  language_fingerprint text,
  
  -- Risk metrics
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  total_sessions integer NOT NULL DEFAULT 1,
  associated_user_ids uuid[] NOT NULL DEFAULT '{}',
  associated_ip_ranges inet[] NOT NULL DEFAULT '{}',
  
  -- Fraud flags
  is_blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  blocked_at timestamptz,
  
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- IP reputation tracking
CREATE TABLE IF NOT EXISTS public.ip_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  ip_range cidr,
  
  -- Reputation scores
  trust_score integer NOT NULL DEFAULT 50, -- 0-100
  abuse_score integer NOT NULL DEFAULT 0,   -- 0-100
  
  -- Activity tracking
  total_requests integer NOT NULL DEFAULT 0,
  total_checkins integer NOT NULL DEFAULT 0,
  failed_checkins integer NOT NULL DEFAULT 0,
  suspicious_events integer NOT NULL DEFAULT 0,
  
  -- Flags
  is_proxy boolean NOT NULL DEFAULT false,
  is_vpn boolean NOT NULL DEFAULT false,
  is_tor boolean NOT NULL DEFAULT false,
  is_datacenter boolean NOT NULL DEFAULT false,
  is_known_good boolean NOT NULL DEFAULT false,
  
  -- Geo consistency
  countries_seen text[] NOT NULL DEFAULT '{}',
  last_country text,
  country_change_count integer NOT NULL DEFAULT 0,
  
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (ip_address)
);

-- Proof verification attempts with fraud scoring
CREATE TABLE IF NOT EXISTS public.proof_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  
  -- Device/location data
  device_fingerprint_id uuid REFERENCES public.device_fingerprints(id) ON DELETE SET NULL,
  ip_address inet,
  
  -- Geo data
  claimed_latitude numeric(10, 8),
  claimed_longitude numeric(10, 8),
  claimed_accuracy numeric(8, 2), -- meters
  claimed_country text,
  claimed_city text,
  
  -- Verification result
  venue_latitude numeric(10, 8),
  venue_longitude numeric(10, 8),
  distance_from_venue numeric(10, 2), -- meters
  
  -- Fraud scoring
  risk_level public.fraud_risk_level NOT NULL DEFAULT 'none',
  risk_score numeric(5, 2) NOT NULL DEFAULT 0.00, -- 0-100
  
  -- Individual risk factors (0-100 each)
  velocity_risk numeric(5, 2) DEFAULT 0.00,
  geo_risk numeric(5, 2) DEFAULT 0.00,
  device_risk numeric(5, 2) DEFAULT 0.00,
  behavior_risk numeric(5, 2) DEFAULT 0.00,
  
  -- Verification outcome
  verified boolean,
  verification_method text,
  rejection_reason text,
  
  -- Raw proof data (for analysis)
  proof_bundle jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Velocity check tracking (rate limiting per user/device)
CREATE TABLE IF NOT EXISTS public.velocity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  device_fingerprint_id uuid REFERENCES public.device_fingerprints(id) ON DELETE CASCADE,
  ip_address inet,
  
  check_type text NOT NULL, -- 'checkin', 'join', 'share', 'redemption'
  window_start timestamptz NOT NULL,
  window_duration interval NOT NULL,
  
  count_in_window integer NOT NULL DEFAULT 1,
  limit_for_window integer NOT NULL,
  is_violation boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Suspicious patterns detected
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  alert_type text NOT NULL, -- 'velocity_spike', 'geo_impossible', 'device_farm', 'bot_behavior', 'account_takeover'
  severity public.fraud_risk_level NOT NULL,
  
  -- Affected entities
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  device_fingerprint_id uuid REFERENCES public.device_fingerprints(id) ON DELETE CASCADE,
  ip_address inet,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  
  -- Alert details
  description text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_attempt_ids uuid[] NOT NULL DEFAULT '{}',
  
  -- Status
  status text NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution_notes text,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Check-in fraud prevention rules (configurable)
CREATE TABLE IF NOT EXISTS public.fraud_prevention_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  rule_name text NOT NULL UNIQUE,
  rule_type text NOT NULL, -- 'velocity', 'geo', 'device', 'behavior'
  is_active boolean NOT NULL DEFAULT true,
  
  -- Thresholds
  max_checkins_per_hour integer,
  max_checkins_per_day integer,
  max_devices_per_user integer,
  max_distance_from_venue_meters numeric(10, 2) DEFAULT 500.00,
  min_time_between_checkins interval DEFAULT '5 minutes'::interval,
  
  -- Risk scoring weights
  velocity_weight numeric(4, 2) DEFAULT 25.00,
  geo_weight numeric(4, 2) DEFAULT 25.00,
  device_weight numeric(4, 2) DEFAULT 25.00,
  behavior_weight numeric(4, 2) DEFAULT 25.00,
  
  -- Actions
  action_on_high_risk text DEFAULT 'flag', -- 'flag', 'block', 'require_additional_proof', 'manual_review'
  action_on_critical_risk text DEFAULT 'block',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default fraud prevention rules
INSERT INTO public.fraud_prevention_rules (
  rule_name, rule_type, is_active,
  max_checkins_per_hour, max_checkins_per_day, max_devices_per_user,
  max_distance_from_venue_meters, min_time_between_checkins,
  action_on_high_risk, action_on_critical_risk
) VALUES
  ('Standard Velocity', 'velocity', true, 3, 10, 5, 500, '5 minutes', 'flag', 'block'),
  ('Strict Geo Check', 'geo', true, null, null, null, 200, null, 'require_additional_proof', 'block'),
  ('Device Limit', 'device', true, null, null, 3, null, null, 'flag', 'manual_review')
ON CONFLICT (rule_name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_users ON public.device_fingerprints USING gin(associated_user_ids);

CREATE INDEX IF NOT EXISTS idx_ip_reputation_address ON public.ip_reputation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_trust ON public.ip_reputation(trust_score, abuse_score);

CREATE INDEX IF NOT EXISTS idx_proof_attempts_user ON public.proof_verification_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proof_attempts_moment ON public.proof_verification_attempts(moment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proof_attempts_risk ON public.proof_verification_attempts(risk_level, risk_score);
CREATE INDEX IF NOT EXISTS idx_proof_attempts_device ON public.proof_verification_attempts(device_fingerprint_id);

CREATE INDEX IF NOT EXISTS idx_velocity_checks_user ON public.velocity_checks(user_id, check_type, window_start DESC);
CREATE INDEX IF NOT EXISTS idx_velocity_checks_violation ON public.velocity_checks(is_violation, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user ON public.fraud_alerts(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.velocity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_prevention_rules ENABLE ROW LEVEL SECURITY;

-- Admins can see all fraud data
CREATE POLICY "Fraud data readable by admins"
  ON public.device_fingerprints FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Fraud data readable by admins"
  ON public.ip_reputation FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Proof attempts readable by user"
  ON public.proof_verification_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Proof attempts readable by venue staff"
  ON public.proof_verification_attempts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.venues v
      JOIN public.merchant_profiles mp ON mp.id = v.merchant_id
      WHERE v.id = proof_verification_attempts.venue_id
        AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Velocity readable by user"
  ON public.velocity_checks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Fraud alerts readable by assigned"
  ON public.fraud_alerts FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR user_id = auth.uid());

-- Functions

-- Calculate fraud risk score for a proof verification attempt
CREATE OR REPLACE FUNCTION public.calculate_fraud_risk(
  p_user_id uuid,
  p_device_fingerprint_id uuid,
  p_ip_address inet,
  p_moment_id uuid,
  p_claimed_lat numeric,
  p_claimed_lon numeric,
  p_venue_lat numeric,
  p_venue_lon numeric
)
RETURNS TABLE (
  risk_level public.fraud_risk_level,
  risk_score numeric,
  velocity_risk numeric,
  geo_risk numeric,
  device_risk numeric,
  behavior_risk numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_velocity_risk numeric := 0;
  v_geo_risk numeric := 0;
  v_device_risk numeric := 0;
  v_behavior_risk numeric := 0;
  v_total_score numeric;
  v_risk_level public.fraud_risk_level;
  v_distance numeric;
  v_recent_attempts integer;
  v_rules public.fraud_prevention_rules%ROWTYPE;
BEGIN
  -- Get active rules
  SELECT * INTO v_rules
  FROM public.fraud_prevention_rules
  WHERE is_active = true
  ORDER BY created_at
  LIMIT 1;
  
  -- Velocity risk: check recent attempts
  SELECT count(*) INTO v_recent_attempts
  FROM public.proof_verification_attempts
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour';
  
  IF v_recent_attempts > COALESCE(v_rules.max_checkins_per_hour, 3) THEN
    v_velocity_risk := 100;
  ELSIF v_recent_attempts > 1 THEN
    v_velocity_risk := 50 * (v_recent_attempts::numeric / COALESCE(v_rules.max_checkins_per_hour, 3)::numeric);
  END IF;
  
  -- Geo risk: distance from venue
  IF p_claimed_lat IS NOT NULL AND p_venue_lat IS NOT NULL THEN
    -- Haversine distance (approximate)
    v_distance := 6371000 * acos(
      cos(radians(p_venue_lat)) * cos(radians(p_claimed_lat)) *
      cos(radians(p_claimed_lon) - radians(p_venue_lon)) +
      sin(radians(p_venue_lat)) * sin(radians(p_claimed_lat))
    );
    
    IF v_distance > COALESCE(v_rules.max_distance_from_venue_meters, 500) THEN
      v_geo_risk := 100;
    ELSE
      v_geo_risk := 100 * (v_distance / COALESCE(v_rules.max_distance_from_venue_meters, 500));
    END IF;
  END IF;
  
  -- Device risk: check if device is associated with many users
  IF p_device_fingerprint_id IS NOT NULL THEN
    SELECT CASE 
      WHEN array_length(associated_user_ids, 1) > COALESCE(v_rules.max_devices_per_user, 5) THEN 100
      WHEN array_length(associated_user_ids, 1) > 2 THEN 50
      ELSE 0
    END INTO v_device_risk
    FROM public.device_fingerprints
    WHERE id = p_device_fingerprint_id;
  END IF;
  
  -- IP reputation risk
  IF p_ip_address IS NOT NULL THEN
    SELECT (100 - trust_score) INTO v_behavior_risk
    FROM public.ip_reputation
    WHERE ip_address = p_ip_address;
    
    v_behavior_risk := COALESCE(v_behavior_risk, 0);
  END IF;
  
  -- Calculate weighted total
  v_total_score := (
    v_velocity_risk * COALESCE(v_rules.velocity_weight, 25) +
    v_geo_risk * COALESCE(v_rules.geo_weight, 25) +
    v_device_risk * COALESCE(v_rules.device_weight, 25) +
    v_behavior_risk * COALESCE(v_rules.behavior_weight, 25)
  ) / 100;
  
  -- Determine risk level
  v_risk_level := CASE
    WHEN v_total_score >= 80 THEN 'critical'::public.fraud_risk_level
    WHEN v_total_score >= 60 THEN 'high'::public.fraud_risk_level
    WHEN v_total_score >= 40 THEN 'medium'::public.fraud_risk_level
    WHEN v_total_score >= 20 THEN 'low'::public.fraud_risk_level
    ELSE 'none'::public.fraud_risk_level
  END;
  
  RETURN QUERY SELECT v_risk_level, v_total_score, v_velocity_risk, v_geo_risk, v_device_risk, v_behavior_risk;
END;
$$;

-- Record a proof verification attempt with fraud check
CREATE OR REPLACE FUNCTION public.record_proof_attempt(
  p_moment_id uuid,
  p_user_id uuid,
  p_venue_id uuid,
  p_fingerprint_hash text,
  p_ip_address inet,
  p_claimed_lat numeric,
  p_claimed_lon numeric,
  p_claimed_accuracy numeric,
  p_claimed_country text,
  p_claimed_city text,
  p_venue_lat numeric,
  p_venue_lon numeric,
  p_proof_bundle jsonb DEFAULT '{}'::jsonb
)
RETURNS public.proof_verification_attempts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt public.proof_verification_attempts;
  v_device_id uuid;
  v_risk record;
  v_distance numeric;
BEGIN
  -- Get or create device fingerprint
  SELECT id INTO v_device_id
  FROM public.device_fingerprints
  WHERE fingerprint_hash = p_fingerprint_hash;
  
  IF v_device_id IS NULL THEN
    INSERT INTO public.device_fingerprints (fingerprint_hash)
    VALUES (p_fingerprint_hash)
    RETURNING id INTO v_device_id;
  END IF;
  
  -- Update device fingerprint with this user
  UPDATE public.device_fingerprints
  SET associated_user_ids = array_append(
    CASE WHEN associated_user_ids @> ARRAY[p_user_id] 
      THEN associated_user_ids 
      ELSE COALESCE(associated_user_ids, '{}') || p_user_id 
    END, 
    p_user_id
  ),
  last_seen_at = now(),
  total_sessions = total_sessions + 1
  WHERE id = v_device_id;
  
  -- Calculate distance
  IF p_claimed_lat IS NOT NULL AND p_venue_lat IS NOT NULL THEN
    v_distance := 6371000 * acos(
      cos(radians(p_venue_lat)) * cos(radians(p_claimed_lat)) *
      cos(radians(p_claimed_lon) - radians(p_venue_lon)) +
      sin(radians(p_venue_lat)) * sin(radians(p_claimed_lat))
    );
  END IF;
  
  -- Calculate fraud risk
  SELECT * INTO v_risk
  FROM public.calculate_fraud_risk(
    p_user_id, v_device_id, p_ip_address, p_moment_id,
    p_claimed_lat, p_claimed_lon, p_venue_lat, p_venue_lon
  );
  
  -- Create the attempt record
  INSERT INTO public.proof_verification_attempts (
    moment_id, user_id, venue_id,
    device_fingerprint_id, ip_address,
    claimed_latitude, claimed_longitude, claimed_accuracy,
    claimed_country, claimed_city,
    venue_latitude, venue_longitude, distance_from_venue,
    risk_level, risk_score,
    velocity_risk, geo_risk, device_risk, behavior_risk,
    proof_bundle
  ) VALUES (
    p_moment_id, p_user_id, p_venue_id,
    v_device_id, p_ip_address,
    p_claimed_lat, p_claimed_lon, p_claimed_accuracy,
    p_claimed_country, p_claimed_city,
    p_venue_lat, p_venue_lon, v_distance,
    v_risk.risk_level, v_risk.risk_score,
    v_risk.velocity_risk, v_risk.geo_risk, v_risk.device_risk, v_risk.behavior_risk,
    p_proof_bundle
  )
  RETURNING * INTO v_attempt;
  
  -- Create fraud alert if high/critical risk
  IF v_risk.risk_level IN ('high', 'critical') THEN
    INSERT INTO public.fraud_alerts (
      alert_type, severity, user_id, device_fingerprint_id, ip_address, moment_id,
      description, evidence
    ) VALUES (
      CASE 
        WHEN v_risk.velocity_risk > 70 THEN 'velocity_spike'
        WHEN v_risk.geo_risk > 70 THEN 'geo_impossible'
        WHEN v_risk.device_risk > 70 THEN 'device_farm'
        ELSE 'bot_behavior'
      END,
      v_risk.risk_level,
      p_user_id, v_device_id, p_ip_address, p_moment_id,
      format('High risk proof attempt detected. Score: %s', v_risk.risk_score),
      jsonb_build_object(
        'attempt_id', v_attempt.id,
        'risk_breakdown', jsonb_build_object(
          'velocity', v_risk.velocity_risk,
          'geo', v_risk.geo_risk,
          'device', v_risk.device_risk,
          'behavior', v_risk.behavior_risk
        )
      )
    );
  END IF;
  
  RETURN v_attempt;
END;
$$;

-- Check velocity limits
CREATE OR REPLACE FUNCTION public.check_velocity_limit(
  p_user_id uuid,
  p_check_type text,
  p_limit integer,
  p_window interval DEFAULT '1 hour'::interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - p_window;
  
  -- Count recent attempts
  SELECT count(*) INTO v_count
  FROM public.velocity_checks
  WHERE user_id = p_user_id
    AND check_type = p_check_type
    AND window_start > v_window_start;
  
  -- Record this check
  INSERT INTO public.velocity_checks (
    user_id, check_type, window_start, window_duration,
    count_in_window, limit_for_window, is_violation
  ) VALUES (
    p_user_id, p_check_type, v_window_start, p_window,
    v_count + 1, p_limit, (v_count + 1) > p_limit
  );
  
  RETURN (v_count + 1) <= p_limit;
END;
$$;

-- Get fraud summary for a user (for dashboard display)
CREATE OR REPLACE FUNCTION public.get_user_fraud_summary(p_user_id uuid)
RETURNS TABLE (
  total_attempts bigint,
  high_risk_attempts bigint,
  average_risk_score numeric,
  last_attempt_at timestamptz,
  devices_used bigint,
  velocity_violations bigint,
  current_trust_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    count(*)::bigint,
    count(*) FILTER (WHERE risk_level IN ('high', 'critical'))::bigint,
    COALESCE(avg(risk_score), 0)::numeric,
    max(created_at),
    count(DISTINCT device_fingerprint_id)::bigint,
    (SELECT count(*)::bigint FROM public.velocity_checks 
     WHERE user_id = p_user_id AND is_violation = true),
    (100 - LEAST(count(*) FILTER (WHERE risk_level IN ('high', 'critical')) * 10, 50))::integer
  FROM public.proof_verification_attempts
  WHERE user_id = p_user_id;
END;
$$;

-- Update fraud prevention rule timestamps
CREATE OR REPLACE FUNCTION public.update_fraud_rule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fraud_rule_timestamp
  BEFORE UPDATE ON public.fraud_prevention_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_fraud_rule_timestamp();

NOTIFY pgrst, 'reload schema';
