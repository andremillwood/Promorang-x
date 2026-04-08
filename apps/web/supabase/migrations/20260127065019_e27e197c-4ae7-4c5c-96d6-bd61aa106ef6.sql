-- Add moment lifecycle status enum
CREATE TYPE moment_status AS ENUM (
  'draft',
  'scheduled',
  'joinable',
  'active',
  'closed',
  'archived'
);

-- Add visibility enum
CREATE TYPE moment_visibility AS ENUM ('open', 'invite', 'private');

-- Add status and visibility columns to moments table
ALTER TABLE moments 
ADD COLUMN status moment_status NOT NULL DEFAULT 'joinable',
ADD COLUMN visibility moment_visibility NOT NULL DEFAULT 'open';

-- Migrate existing data: set status based on current timestamps and is_active
UPDATE moments SET status = 
  CASE 
    WHEN is_active = false THEN 'closed'::moment_status
    WHEN ends_at IS NOT NULL AND ends_at < NOW() THEN 'closed'::moment_status
    WHEN starts_at > NOW() THEN 'scheduled'::moment_status
    WHEN starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW()) THEN 'active'::moment_status
    ELSE 'joinable'::moment_status
  END;

-- Create function to compute moment status based on timestamps
CREATE OR REPLACE FUNCTION compute_moment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-compute if not explicitly set to draft or archived
  IF NEW.status IN ('draft', 'archived') THEN
    RETURN NEW;
  END IF;
  
  -- Compute based on timestamps
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NOW() THEN
    NEW.status = 'closed';
  ELSIF NEW.starts_at > NOW() THEN
    NEW.status = 'scheduled';
  ELSIF NEW.starts_at <= NOW() AND (NEW.ends_at IS NULL OR NEW.ends_at > NOW()) THEN
    NEW.status = 'active';
  ELSE
    NEW.status = 'joinable';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for insert/update
CREATE TRIGGER set_moment_status
  BEFORE INSERT OR UPDATE OF starts_at, ends_at ON moments
  FOR EACH ROW
  EXECUTE FUNCTION compute_moment_status();

-- Update RLS policies for visibility
-- Anyone can view open moments that are joinable or active
CREATE POLICY "Anyone can view open joinable/active moments"
  ON moments FOR SELECT
  USING (visibility = 'open' AND status IN ('joinable', 'active', 'scheduled'));

-- Hosts can always view their own moments regardless of status/visibility
DROP POLICY IF EXISTS "Hosts can view their own moments" ON moments;
CREATE POLICY "Hosts can view their own moments"
  ON moments FOR SELECT
  USING (auth.uid() = host_id);

-- Update existing active moments policy to consider status
DROP POLICY IF EXISTS "Anyone can view active moments" ON moments;
CREATE POLICY "Anyone can view active/closed moments for archives"
  ON moments FOR SELECT
  USING (status IN ('active', 'closed') AND visibility = 'open');