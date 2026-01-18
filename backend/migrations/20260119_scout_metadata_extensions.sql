-- Extension for Bounty Scout Metadata
ALTER TABLE bounty_scout_records 
ADD COLUMN IF NOT EXISTS external_creator_id TEXT,
ADD COLUMN IF NOT EXISTS external_metadata JSONB;

COMMENT ON COLUMN bounty_scout_records.external_creator_id IS 'The author/channel ID from the external platform (YouTube/TikTok).';
COMMENT ON COLUMN bounty_scout_records.external_metadata IS 'Raw oEmbed or crawler metadata for auditing.';
