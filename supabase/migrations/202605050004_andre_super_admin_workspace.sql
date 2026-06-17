-- Schema support for platform-owner access and official organization attribution.
-- The data grant is intentionally split into the next migration so newly-added
-- enum values are committed before they are used in inserts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'user_role'
  ) THEN
    CREATE TYPE public.user_role AS ENUM (
      'participant',
      'creator',
      'host',
      'brand',
      'merchant',
      'agency',
      'promoter',
      'marketing',
      'moderator',
      'admin',
      'master_admin'
    );
  END IF;
END $$;

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'creator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'agency';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'promoter';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'master_admin';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'user_role_type'
  ) THEN
    CREATE TYPE public.user_role_type AS ENUM ('user', 'moderator', 'admin', 'master_admin');
  END IF;
END $$;

ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'master_admin';

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (
    role::text IN (
      'participant',
      'creator',
      'host',
      'brand',
      'merchant',
      'agency',
      'promoter',
      'marketing',
      'moderator',
      'admin',
      'master_admin'
    )
  );

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role public.user_role_type DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'org_member_role'
  ) THEN
    CREATE TYPE public.org_member_role AS ENUM ('owner', 'admin', 'manager', 'staff');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL,
  billing_email text,
  avatar_url text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_member_role DEFAULT 'staff',
  joined_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_moments_organization_id
  ON public.moments(organization_id);

NOTIFY pgrst, 'reload schema';
