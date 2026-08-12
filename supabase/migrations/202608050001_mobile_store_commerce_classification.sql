-- Store-policy classification for native commerce. Unclassified listings fail closed.

do $$ begin
  create type public.mobile_store_commerce_classification as enum (
    'not_classified',
    'physical',
    'service',
    'digital'
  );
exception when duplicate_object then null;
end $$;

alter table public.merchant_products
  add column if not exists mobile_store_classification public.mobile_store_commerce_classification not null default 'not_classified',
  add column if not exists mobile_purchase_enabled boolean not null default false,
  add column if not exists mobile_classification_reviewed_at timestamptz,
  add column if not exists mobile_classification_reviewed_by uuid references auth.users(id) on delete set null;

alter table public.merchant_products
  drop constraint if exists merchant_products_mobile_purchase_requires_eligible_class;

alter table public.merchant_products
  add constraint merchant_products_mobile_purchase_requires_eligible_class
  check (
    mobile_purchase_enabled = false
    or mobile_store_classification in ('physical', 'service')
  );

comment on column public.merchant_products.mobile_store_classification is
  'Native-store commerce class. Missing/ambiguous listings remain not_classified and fail closed.';
comment on column public.merchant_products.mobile_purchase_enabled is
  'Explicit approval for native checkout after store-policy and fulfillment review.';

