-- FAT Wednesdays is the Tracks & Records midweek social / DJ night.
-- It is not a board-game night. Keep the seeded title honest.
UPDATE public.moments
SET
  title = 'FAT Wednesdays at Tracks & Records',
  description = 'Midweek social and DJ night at Usain Bolt''s Tracks & Records in Marketplace. Jerk platters, live music, and screens — not a board-game night.',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0002-000000000025'
   OR title = 'FAT Wednesdays Live Social & Game Night';
