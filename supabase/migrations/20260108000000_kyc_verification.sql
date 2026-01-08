-- Create KYC status enum
CREATE TYPE kyc_status_type AS ENUM ('none', 'pending', 'verified', 'rejected');

-- Add kyc_status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status kyc_status_type DEFAULT 'none';

-- Create KYC verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'license', 'id_card')),
    document_url TEXT NOT NULL,
    status kyc_status_type DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_verifications
CREATE POLICY "Users can view their own KYC verifications"
    ON kyc_verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC verifications"
    ON kyc_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only admins/service role can update status (implied by lack of UPDATE policy for users)
-- In a real scenario, we might add an admin role check policy here.

-- Create index
CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
