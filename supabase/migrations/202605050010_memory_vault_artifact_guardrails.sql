-- Ensure each participant can receive a durable Vault memory per Moment.
-- If older data already contains duplicates, keep the migration non-destructive
-- and fall back to a lookup index; the issuance service remains idempotent.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.memories
    GROUP BY user_id, moment_id
    HAVING COUNT(*) > 1
    LIMIT 1
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_user_moment_unique ON public.memories(user_id, moment_id)';
  ELSE
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_memories_user_moment_lookup ON public.memories(user_id, moment_id)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memories_user_artifact_source
  ON public.memories(user_id, ((metadata->>'artifact_type')), issued_at DESC);

NOTIFY pgrst, 'reload schema';
