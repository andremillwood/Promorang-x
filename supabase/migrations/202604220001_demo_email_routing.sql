-- Route demo-experience emails to the visitor's chosen inbox without changing
-- the stable seeded demo account emails used for login and relationships.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS demo_email_recipient TEXT;

CREATE INDEX IF NOT EXISTS idx_users_demo_email_recipient
ON public.users(demo_email_recipient)
WHERE demo_email_recipient IS NOT NULL;
