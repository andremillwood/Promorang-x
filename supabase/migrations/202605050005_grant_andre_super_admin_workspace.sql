-- Grant Andre Millwood full platform-owner access and an official Promorang workspace.

WITH andre AS (
  SELECT id, email
  FROM auth.users
  WHERE lower(email) = 'andremillwood@gmail.com'
  LIMIT 1
),
promorang_org AS (
  INSERT INTO public.organizations (
    name,
    slug,
    type,
    billing_email,
    website,
    created_by
  )
  SELECT
    'Promorang',
    'promorang',
    'brand',
    'andremillwood@gmail.com',
    'https://promorang.co',
    andre.id
  FROM andre
  ON CONFLICT (slug) DO UPDATE
    SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      billing_email = EXCLUDED.billing_email,
      website = EXCLUDED.website,
      created_by = COALESCE(public.organizations.created_by, EXCLUDED.created_by),
      updated_at = now()
  RETURNING id
)
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT promorang_org.id, andre.id, 'owner'::public.org_member_role
FROM promorang_org
CROSS JOIN andre
ON CONFLICT (organization_id, user_id) DO UPDATE
  SET role = 'owner'::public.org_member_role;

DO $$
DECLARE
  andre_id uuid;
  andre_email text;
BEGIN
  SELECT id, email
  INTO andre_id, andre_email
  FROM auth.users
  WHERE lower(email) = 'andremillwood@gmail.com'
  LIMIT 1;

  IF andre_id IS NULL THEN
    RAISE NOTICE 'Auth user andremillwood@gmail.com does not exist yet; skipped public.users profile grant.';
    RETURN;
  END IF;

  UPDATE public.users
  SET
    username = COALESCE(public.users.username, 'andremillwood'),
    display_name = COALESCE(public.users.display_name, 'Andre Millwood'),
    user_type = 'master_admin',
    role = 'master_admin'::public.user_role_type,
    updated_at = now()
  WHERE lower(email) = 'andremillwood@gmail.com';

  IF FOUND THEN
    RETURN;
  END IF;

  UPDATE public.users
  SET
    email = andre_email,
    username = COALESCE(public.users.username, 'andremillwood'),
    display_name = COALESCE(public.users.display_name, 'Andre Millwood'),
    user_type = 'master_admin',
    role = 'master_admin'::public.user_role_type,
    updated_at = now()
  WHERE id = andre_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.users existing
      WHERE lower(existing.email) = 'andremillwood@gmail.com'
        AND existing.id <> andre_id
    );

  IF FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    username,
    display_name,
    user_type,
    role
  )
  VALUES (
    andre_id,
    andre_email,
    'andremillwood',
    'Andre Millwood',
    'master_admin',
    'master_admin'::public.user_role_type
  );
END $$;

DO $$
DECLARE
  role_udt_name text;
BEGIN
  SELECT udt_name
  INTO role_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_roles'
    AND column_name = 'role';

  IF role_udt_name = 'user_role' THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT andre.id, roles.role::public.user_role
    FROM (
      SELECT id
      FROM auth.users
      WHERE lower(email) = 'andremillwood@gmail.com'
      LIMIT 1
    ) andre
    CROSS JOIN (
      VALUES
        ('master_admin'),
        ('admin'),
        ('moderator'),
        ('host'),
        ('brand'),
        ('merchant'),
        ('agency'),
        ('creator'),
        ('promoter'),
        ('marketing'),
        ('participant')
    ) AS roles(role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    SELECT andre.id, roles.role
    FROM (
      SELECT id
      FROM auth.users
      WHERE lower(email) = 'andremillwood@gmail.com'
      LIMIT 1
    ) andre
    CROSS JOIN (
      VALUES
        ('master_admin'),
        ('admin'),
        ('moderator'),
        ('host'),
        ('brand'),
        ('merchant'),
        ('agency'),
        ('creator'),
        ('promoter'),
        ('marketing'),
        ('participant')
    ) AS roles(role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
