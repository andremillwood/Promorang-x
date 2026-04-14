-- Add compiler_metadata to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS compiler_metadata JSONB;
