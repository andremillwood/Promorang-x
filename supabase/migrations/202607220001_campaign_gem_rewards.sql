-- Campaign plans may describe Gem rewards before funding. A campaign remains
-- inactive until its activation reserve is secured through the canonical ledger.
alter type public.reward_type add value if not exists 'gems';

comment on column public.campaigns.reward_type is
  'The value offered for accepted participation. Gem rewards require a secured activation reserve before the campaign can become active.';

notify pgrst, 'reload schema';
