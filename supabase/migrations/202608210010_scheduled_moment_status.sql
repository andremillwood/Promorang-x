-- Align the live Moment lifecycle enum with the scheduled-event state already
-- supported by the application and the attributed event publisher.
ALTER TYPE public.moment_status ADD VALUE IF NOT EXISTS 'scheduled';

NOTIFY pgrst, 'reload schema';
