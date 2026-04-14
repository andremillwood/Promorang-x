-- NUCLEAR RESET FOR DEMO ACCOUNTS
-- PURPOSE: Wipes the "Corrupted" auth history for demo accounts so they can be re-created fresh.
-- RUN THIS ONCE in the Supabase Dashboard SQL Editor.

-- 1. Identify and delete from auth.users (This cascades to public.users if triggers are active)
DELETE FROM auth.users 
WHERE email IN (
  'participant@promorang.co',
  'host@promorang.co',
  'brand@promorang.co',
  'merchant@promorang.co'
);

-- 2. Ensure any lingering profiles in public.users are also wiped
DELETE FROM public.users 
WHERE email IN (
  'participant@promorang.co',
  'host@promorang.co',
  'brand@promorang.co',
  'merchant@promorang.co'
);

-- 3. Success Message
SELECT '✅ Demo accounts have been hard-reset. You can now try logging in from the portal.' as result;
