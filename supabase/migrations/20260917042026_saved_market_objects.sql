-- Extend the existing user-owned saved-object relationship ledger so PromoCard
-- can remember approved Discoveries and canonical Demand questions without
-- creating a second watchlist or new market object family.

alter table if exists public.saved_objects
  drop constraint if exists saved_objects_object_type_check;

alter table if exists public.saved_objects
  add constraint saved_objects_object_type_check
  check (object_type in (
    'moment',
    'mission',
    'creator',
    'scene',
    'product',
    'offer',
    'piece',
    'merchant',
    'content',
    'campaign',
    'discovery',
    'demand'
  ));

notify pgrst, 'reload schema';
