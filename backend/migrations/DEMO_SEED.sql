-- DEMO SEED SCRIPT (v18.0 - SCHEMA-VERIFIED)
-- Based on actual table schemas from 20260205_auth_resiliency_fix.sql
-- and 20260106_ensure_demo_users.sql
-- RUN THIS ONCE in the Supabase Dashboard SQL Editor.

-- 1. DICTIONARY: Ensure user_role enum exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('participant', 'host', 'brand', 'merchant', 'admin', 'advertiser', 'creator');
    END IF;
END $$;

-- 2. CLEAN SLATE: Delete demo records from ALL dependent tables first
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid;
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000003'::uuid;
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000004'::uuid;

DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000003'::uuid;
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;

DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000003'::uuid;
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;

DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000003'::uuid;
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;

DELETE FROM auth.users WHERE email = 'demo.participant@promorang.co';
DELETE FROM auth.users WHERE email = 'demo.host@promorang.co';
DELETE FROM auth.users WHERE email = 'demo.brand@promorang.co';
DELETE FROM auth.users WHERE email = 'demo.merchant@promorang.co';

-- 3. CREATE AUTH USERS: One at a time with ALL required columns including aud
-- The on_auth_user_created trigger will auto-create public.users and public.profiles entries.
-- Password for all: Promorang2025!

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token,
    email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'demo.participant@promorang.co',
    crypt('Promorang2025!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Participant","user_type":"participant"}',
    now(), now(), '', '', '', ''
);

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token,
    email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'demo.host@promorang.co',
    crypt('Promorang2025!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Host","user_type":"host"}',
    now(), now(), '', '', '', ''
);

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token,
    email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'demo.brand@promorang.co',
    crypt('Promorang2025!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Brand","user_type":"brand"}',
    now(), now(), '', '', '', ''
);

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token,
    email_change, email_change_token_new, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'demo.merchant@promorang.co',
    crypt('Promorang2025!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Merchant","user_type":"merchant"}',
    now(), now(), '', '', '', ''
);

-- 4. ENSURE public.users records exist (trigger should handle this, but just in case)
INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo.participant@promorang.co', 'demo.participant', 'Demo Participant', 'participant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000002', 'demo.host@promorang.co', 'demo.host', 'Demo Host', 'host')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000003', 'demo.brand@promorang.co', 'demo.brand', 'Demo Brand', 'brand')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000004', 'demo.merchant@promorang.co', 'demo.merchant', 'Demo Merchant', 'merchant')
ON CONFLICT (id) DO NOTHING;

-- 5. ENSURE public.profiles records exist (trigger should handle this, but just in case)
INSERT INTO public.profiles (id, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo.participant', 'Demo Participant', 'participant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000002', 'demo.host', 'Demo Host', 'host')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000003', 'demo.brand', 'Demo Brand', 'brand')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, display_name, user_type)
VALUES ('00000000-0000-0000-0000-000000000004', 'demo.merchant', 'Demo Merchant', 'merchant')
ON CONFLICT (id) DO NOTHING;

-- 6. ROLE MAPPING
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'participant'::public.user_role) ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000002'::uuid, 'host'::public.user_role) ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000003'::uuid, 'brand'::public.user_role) ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000004'::uuid, 'merchant'::public.user_role) ON CONFLICT (user_id, role) DO NOTHING;

-- 7. VERIFICATION
SELECT 'SUCCESS: Demo accounts created. Password: Promorang2025!' as result;
