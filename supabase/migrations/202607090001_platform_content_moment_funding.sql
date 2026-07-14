-- Allow Promorang-backed and content-backed reward allocation sources.

ALTER TYPE public.moment_money_source ADD VALUE IF NOT EXISTS 'platform';
ALTER TYPE public.moment_money_source ADD VALUE IF NOT EXISTS 'content';

NOTIFY pgrst, 'reload schema';
