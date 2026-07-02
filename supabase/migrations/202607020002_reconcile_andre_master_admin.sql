-- Reconcile the platform-owner grant for accounts created after the original
-- one-time seed migration ran.
DO $$
DECLARE
  andre_id uuid;
BEGIN
  SELECT id INTO andre_id
  FROM auth.users
  WHERE lower(email) = 'andremillwood@gmail.com'
  LIMIT 1;

  IF andre_id IS NULL THEN
    RAISE NOTICE 'andremillwood@gmail.com has not signed up yet; no grant applied.';
    RETURN;
  END IF;

  UPDATE public.users
  SET user_type = 'master_admin',
      role = 'master_admin'::public.user_role_type,
      updated_at = now()
  WHERE id = andre_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (andre_id, 'master_admin'),
    (andre_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

NOTIFY pgrst, 'reload schema';
