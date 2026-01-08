-- Create User Role Enum
CREATE TYPE user_role_type AS ENUM ('user', 'moderator', 'admin', 'master_admin');

-- Add role to users table with default 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role_type DEFAULT 'user';

-- Set master admin
UPDATE users 
SET role = 'master_admin' 
WHERE email = 'andremillwood@gmail.com';

-- Create Support Ticket Enums
CREATE TYPE support_category AS ENUM ('account', 'billing', 'content_report', 'feature_request', 'bug', 'other');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high');

-- Create Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category support_category NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status support_status DEFAULT 'open',
    priority support_priority DEFAULT 'medium',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins/Mods can view all tickets (implied by service role or specific admin policy in real app)
-- Ideally, we add a policy:
-- CREATE POLICY "Admins can view all tickets" ON support_tickets FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'master_admin', 'moderator'))
-- );

-- Index
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
