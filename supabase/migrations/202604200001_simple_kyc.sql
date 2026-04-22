-- Simple KYC System (Manual Review)
-- No paid providers needed - perfect for early-stage platforms
-- Timestamp: 2026-04-20

-- =====================================================
-- 1. KYC SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.simple_kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'pending_review' 
    CHECK (status IN (
      'pending_review',      -- Submitted, waiting for admin
      'in_review',          -- Admin is reviewing
      'additional_info_needed', -- Need more docs from user
      'approved',           -- Verified!
      'rejected'            -- Denied
    )),
  
  -- Personal Information
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  nationality text,
  country_of_residence text,
  
  -- Address
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  
  -- Contact
  phone_number text,
  
  -- Identity Documents
  id_document_type text CHECK (id_document_type IN (
    'passport', 'drivers_license', 'national_id', 'residence_permit'
  )),
  id_document_front_url text NOT NULL,
  id_document_back_url text,
  
  -- Additional verification
  selfie_url text,                    -- Photo of user holding ID
  proof_of_address_url text,          -- Utility bill, bank statement
  
  -- Supplementary info
  occupation text,
  source_of_funds text CHECK (source_of_funds IN (
    'salary', 'business', 'investment', 'savings', 'inheritance', 'gift', 'other'
  )),
  
  -- Review tracking
  reviewer_id uuid REFERENCES public.users(id),
  review_started_at timestamptz,
  review_notes text,
  
  -- Approval/Rejection
  approved_at timestamptz,
  assigned_level public.kyc_level,    -- basic, intermediate, advanced
  
  rejected_at timestamptz,
  rejection_reason text,
  rejection_category text CHECK (rejection_category IN (
    'document_unclear', 'document_expired', 'identity_mismatch',
    'underage', 'sanctions', 'fraud_suspected', 'incomplete_info', 'other'
  )),
  
  -- Additional info request
  additional_info_requested text,
  additional_info_requested_at timestamptz,
  additional_info_provided text,
  additional_info_provided_at timestamptz,
  
  -- Timestamps
  submitted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_simple_kyc_user ON public.simple_kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_simple_kyc_status ON public.simple_kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_simple_kyc_submitted ON public.simple_kyc_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_simple_kyc_reviewer ON public.simple_kyc_submissions(reviewer_id);

-- =====================================================
-- 2. ADMIN NOTES (For reviewer collaboration)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.kyc_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.simple_kyc_submissions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.users(id),
  
  note text NOT NULL,
  is_internal boolean DEFAULT true,  -- false = visible to user
  
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_kyc_notes_submission ON public.kyc_admin_notes(submission_id);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

ALTER TABLE public.simple_kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_admin_notes ENABLE ROW LEVEL SECURITY;

-- Users can see own submissions
CREATE POLICY "Users can view own KYC submissions" ON public.simple_kyc_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create own submissions
CREATE POLICY "Users can create own KYC submissions" ON public.simple_kyc_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update (handled in application layer with service key)
CREATE POLICY "Users cannot modify submissions" ON public.simple_kyc_submissions
  FOR UPDATE USING (false);

-- Admin notes are internal only
CREATE POLICY "Admin notes not visible to users" ON public.kyc_admin_notes
  FOR SELECT USING (false);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Get submissions needing review (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_pending_kyc_submissions()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  status text,
  submitted_at timestamptz,
  days_waiting integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    u.email as user_email,
    s.status,
    s.submitted_at,
    EXTRACT(DAY FROM (timezone('utc', now()) - s.submitted_at))::integer as days_waiting
  FROM public.simple_kyc_submissions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.status IN ('pending_review', 'additional_info_needed')
  ORDER BY s.submitted_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.touch_simple_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_simple_kyc_touch') THEN
    CREATE TRIGGER trg_simple_kyc_touch
      BEFORE UPDATE ON public.simple_kyc_submissions
      FOR EACH ROW EXECUTE FUNCTION public.touch_simple_kyc_updated_at();
  END IF;
END $$;

notify pgrst, 'reload schema';
