-- Migration: Add KYC Status to Users
-- Date: 2026-01-21

-- Add kyc_status column to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'unverified' 
CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Create a table for KYC verification submissions
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed a value for the user for testing if needed
-- UPDATE users SET kyc_status = 'verified' WHERE email = 'andremillwood@gmail.com';
