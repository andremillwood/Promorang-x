-- Atomic Pieces custody, trading, fees, dividends, and reconciliation.

create table if not exists public.piece_market_controls (
  singleton boolean primary key default true check(singleton),
  trading_enabled boolean not null default false,
  amm_enabled boolean not null default false,
  dividends_enabled boolean not null default false,
  suspension_reason text,
  updated_at timestamptz not null default now()
);
insert into public.piece_market_controls(singleton) values(true) on conflict do nothing;
update public.piece_liquidity_pools
set k_constant=pieces_reserve*currency_reserve
where k_constant=0 and pieces_reserve>0 and currency_reserve>0;

create table if not exists public.piece_escrow (
  listing_id uuid primary key references public.piece_listings(id) on delete cascade,
  owner_id uuid not null references public.users(id),
  piece_type public.piece_type not null,
  asset_id uuid not null,
  quantity numeric(24,8) not null check(quantity > 0),
  released_quantity numeric(24,8) not null default 0 check(released_quantity >= 0),
  status text not null default 'held' check(status in ('held','partially_released','released','returned')),
  created_at timestamptz not null default now(),
  check(released_quantity <= quantity)
);

create table if not exists public.piece_settlement_ledger (
  id uuid primary key default gen_random_uuid(),
  settlement_type text not null check(settlement_type in ('order_trade','amm_swap','creator_royalty','platform_fee','liquidity_fee','dividend')),
  piece_type public.piece_type,
  asset_id uuid,
  user_id uuid references public.users(id),
  reference_id uuid,
  gems_amount numeric(18,4) not null default 0,
  pieces_amount numeric(24,8) not null default 0,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.piece_fee_reserves (
  reserve_type text primary key check(reserve_type in ('platform','liquidity')),
  gems_balance numeric(18,4) not null default 0 check(gems_balance >= 0),
  updated_at timestamptz not null default now()
);
insert into public.piece_fee_reserves(reserve_type) values('platform'),('liquidity') on conflict do nothing;
create unique index if not exists uq_piece_amm_swap_idempotency
  on public.piece_amm_swaps(transaction_hash) where transaction_hash is not null;

alter table public.piece_trades
  add column if not exists platform_fee numeric(14,4) not null default 0,
  add column if not exists creator_fee numeric(14,4) not null default 0,
  add column if not exists liquidity_fee numeric(14,4) not null default 0,
  add column if not exists settlement_status text not null default 'pending'
    check(settlement_status in ('pending','settled','reversed')),
  add column if not exists idempotency_key text;
create unique index if not exists uq_piece_trade_idempotency on public.piece_trades(idempotency_key) where idempotency_key is not null;

create or replace function public.piece_position_balance(p_type public.piece_type,p_asset uuid,p_holder uuid)
returns numeric language plpgsql stable security definer set search_path=public as $$
declare v numeric;
begin
  case p_type
    when 'content' then select pieces_owned into v from public.content_piece_positions where content_id=p_asset and holder_id=p_holder;
    when 'moment' then select pieces_owned into v from public.moment_piece_positions where moment_id=p_asset and holder_id=p_holder;
    when 'host' then select pieces_owned into v from public.host_piece_positions where host_id=p_asset and holder_id=p_holder;
    when 'venue' then select pieces_owned into v from public.venue_piece_positions where venue_id=p_asset and holder_id=p_holder;
  end case;
  return coalesce(v,0);
end $$;

create or replace function public.adjust_piece_position(
  p_type public.piece_type,p_asset uuid,p_holder uuid,p_delta numeric,p_price numeric
) returns numeric language plpgsql security definer set search_path=public as $$
declare v_after numeric; v_current numeric;
begin
  v_current:=public.piece_position_balance(p_type,p_asset,p_holder);
  v_after:=v_current+p_delta;
  if v_after<0 then raise exception 'Insufficient Pieces'; end if;
  case p_type
    when 'content' then insert into public.content_piece_positions(content_id,holder_id,pieces_owned,total_invested,avg_purchase_price,last_trade_at)
      values(p_asset,p_holder,v_after,greatest(p_delta,0)*p_price,case when p_delta>0 then p_price else null end,now())
      on conflict(content_id,holder_id) do update set pieces_owned=v_after,last_trade_at=now(),updated_at=now();
    when 'moment' then insert into public.moment_piece_positions(moment_id,holder_id,pieces_owned,total_invested,avg_purchase_price,last_trade_at)
      values(p_asset,p_holder,v_after,greatest(p_delta,0)*p_price,case when p_delta>0 then p_price else null end,now())
      on conflict(moment_id,holder_id) do update set pieces_owned=v_after,last_trade_at=now(),updated_at=now();
    when 'host' then insert into public.host_piece_positions(host_id,holder_id,pieces_owned,total_invested,avg_purchase_price,last_trade_at)
      values(p_asset,p_holder,v_after,greatest(p_delta,0)*p_price,case when p_delta>0 then p_price else null end,now())
      on conflict(host_id,holder_id) do update set pieces_owned=v_after,last_trade_at=now(),updated_at=now();
    when 'venue' then insert into public.venue_piece_positions(venue_id,holder_id,pieces_owned,total_invested,avg_purchase_price,last_trade_at)
      values(p_asset,p_holder,v_after,greatest(p_delta,0)*p_price,case when p_delta>0 then p_price else null end,now())
      on conflict(venue_id,holder_id) do update set pieces_owned=v_after,last_trade_at=now(),updated_at=now();
  end case;
  return v_after;
end $$;

create or replace function public.create_escrowed_piece_listing(
  p_type public.piece_type,p_asset uuid,p_seller uuid,p_quantity numeric,p_price numeric,p_expires timestamptz default null
) returns public.piece_listings language plpgsql security definer set search_path=public as $$
declare v_listing public.piece_listings%rowtype; v_enabled boolean;
begin
  select trading_enabled into v_enabled from public.piece_market_controls where singleton=true;
  if not v_enabled then raise exception 'Pieces trading is suspended'; end if;
  if p_quantity<=0 or p_price<=0 then raise exception 'Quantity and price must be positive'; end if;
  perform public.adjust_piece_position(p_type,p_asset,p_seller,-p_quantity,p_price);
  insert into public.piece_listings(piece_type,asset_id,seller_id,quantity,price_per_piece,listing_type,expires_at)
    values(p_type,p_asset,p_seller,p_quantity,p_price,'sell',p_expires) returning * into v_listing;
  insert into public.piece_escrow(listing_id,owner_id,piece_type,asset_id,quantity)
    values(v_listing.id,p_seller,p_type,p_asset,p_quantity);
  return v_listing;
end $$;

create or replace function public.buy_piece_listing(
  p_listing uuid,p_buyer uuid,p_quantity numeric,p_idempotency text
) returns public.piece_trades language plpgsql security definer set search_path=public as $$
declare v_listing public.piece_listings%rowtype; v_escrow public.piece_escrow%rowtype; v_trade public.piece_trades%rowtype;
  v_gross numeric; v_platform numeric; v_creator numeric; v_liquidity numeric; v_seller_net numeric; v_creator_id uuid; v_enabled boolean;
begin
  select trading_enabled into v_enabled from public.piece_market_controls where singleton=true;
  if not v_enabled then raise exception 'Pieces trading is suspended'; end if;
  select * into v_trade from public.piece_trades where idempotency_key=p_idempotency; if found then return v_trade; end if;
  select * into v_listing from public.piece_listings where id=p_listing and status='active' for update;
  if not found or v_listing.listing_type<>'sell' or (v_listing.expires_at is not null and v_listing.expires_at<=now()) then raise exception 'Listing unavailable'; end if;
  if p_buyer=v_listing.seller_id then raise exception 'Cannot buy your own listing'; end if;
  select * into v_escrow from public.piece_escrow where listing_id=p_listing and status in ('held','partially_released') for update;
  if p_quantity<=0 or p_quantity>v_escrow.quantity-v_escrow.released_quantity then raise exception 'Insufficient escrowed Pieces'; end if;
  v_gross:=round(p_quantity*v_listing.price_per_piece,2); v_platform:=round(v_gross*.01,2); v_creator:=round(v_gross*.005,2); v_liquidity:=round(v_gross*.005,2); v_seller_net:=v_gross-v_platform-v_creator-v_liquidity;
  case v_listing.piece_type
    when 'content' then select creator_id into v_creator_id from public.content_items where id=v_listing.asset_id;
    when 'moment' then select organizer_id into v_creator_id from public.moments where id=v_listing.asset_id;
    when 'host' then select user_id into v_creator_id from public.host_profiles where id=v_listing.asset_id;
    when 'venue' then v_creator_id:=null;
  end case;
  perform public.post_economy_transaction(p_buyer,'gems',-v_gross,'spend','piece_purchase',p_idempotency||':buyer',p_listing,'piece_listings','Piece purchase',jsonb_build_object('quantity',p_quantity));
  perform public.post_economy_transaction(v_listing.seller_id,'gems',v_seller_net,'earn','piece_sale',p_idempotency||':seller',p_listing,'piece_listings','Piece sale proceeds','{}');
  if v_creator_id is not null and v_creator>0 then perform public.post_economy_transaction(v_creator_id,'gems',v_creator,'earn','piece_creator_royalty',p_idempotency||':creator',p_listing,'piece_listings','Piece creator royalty','{}'); end if;
  perform public.adjust_piece_position(v_listing.piece_type,v_listing.asset_id,p_buyer,p_quantity,v_listing.price_per_piece);
  update public.piece_escrow set released_quantity=released_quantity+p_quantity,status=case when released_quantity+p_quantity=quantity then 'released' else 'partially_released' end where listing_id=p_listing;
  update public.piece_listings set quantity=quantity-p_quantity,status=case when quantity-p_quantity=0 then 'filled' else 'active' end,filled_at=case when quantity-p_quantity=0 then now() else null end,updated_at=now() where id=p_listing;
  insert into public.piece_trades(piece_type,asset_id,buyer_id,seller_id,quantity,price_per_piece,total_value,trade_type,listing_id,platform_fee,creator_fee,liquidity_fee,settlement_status,idempotency_key)
    values(v_listing.piece_type,v_listing.asset_id,p_buyer,v_listing.seller_id,p_quantity,v_listing.price_per_piece,v_gross,'market',p_listing,v_platform,v_creator,v_liquidity,'settled',p_idempotency) returning * into v_trade;
  insert into public.piece_settlement_ledger(settlement_type,piece_type,asset_id,user_id,reference_id,gems_amount,pieces_amount,idempotency_key,metadata)
    values('order_trade',v_listing.piece_type,v_listing.asset_id,p_buyer,v_trade.id,-v_gross,p_quantity,p_idempotency,jsonb_build_object('seller_net',v_seller_net,'fees',v_platform+v_creator+v_liquidity));
  update public.piece_fee_reserves set gems_balance=gems_balance+v_platform,updated_at=now() where reserve_type='platform';
  update public.piece_fee_reserves set gems_balance=gems_balance+v_liquidity,updated_at=now() where reserve_type='liquidity';
  insert into public.piece_settlement_ledger(settlement_type,piece_type,asset_id,reference_id,gems_amount,idempotency_key)
    values('platform_fee',v_listing.piece_type,v_listing.asset_id,v_trade.id,v_platform,p_idempotency||':platform'),
          ('liquidity_fee',v_listing.piece_type,v_listing.asset_id,v_trade.id,v_liquidity,p_idempotency||':liquidity');
  return v_trade;
end $$;

create or replace function public.cancel_piece_listing(p_listing uuid,p_owner uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_listing public.piece_listings%rowtype; v_escrow public.piece_escrow%rowtype; v_return numeric;
begin
  select * into v_listing from public.piece_listings where id=p_listing and seller_id=p_owner and status='active' for update;
  if not found then raise exception 'Active listing not found'; end if;
  select * into v_escrow from public.piece_escrow where listing_id=p_listing for update;
  v_return:=v_escrow.quantity-v_escrow.released_quantity;
  if v_return>0 then perform public.adjust_piece_position(v_listing.piece_type,v_listing.asset_id,p_owner,v_return,v_listing.price_per_piece); end if;
  update public.piece_escrow set status='returned',released_quantity=quantity where listing_id=p_listing;
  update public.piece_listings set status='cancelled',cancelled_at=now(),updated_at=now() where id=p_listing;
  return true;
end $$;

create or replace function public.swap_gems_for_pieces(
  p_pool uuid,p_trader uuid,p_gems numeric,p_min_pieces numeric,p_idempotency text
) returns public.piece_amm_swaps language plpgsql security definer set search_path=public as $$
declare v_pool public.piece_liquidity_pools%rowtype; v_swap public.piece_amm_swaps%rowtype; v_fee numeric; v_protocol numeric; v_lp numeric; v_net numeric; v_out numeric; v_before numeric; v_after numeric; v_enabled boolean;
begin
  select amm_enabled into v_enabled from public.piece_market_controls where singleton=true;
  if not v_enabled then raise exception 'AMM trading is suspended'; end if;
  select * into v_swap from public.piece_amm_swaps where transaction_hash=p_idempotency; if found then return v_swap; end if;
  select * into v_pool from public.piece_liquidity_pools where id=p_pool and status='active' for update;
  if not found or p_gems<=0 or v_pool.pieces_reserve<=0 or v_pool.currency_reserve<=0 then raise exception 'Pool unavailable'; end if;
  v_fee:=p_gems*v_pool.swap_fee_percent; v_protocol:=p_gems*v_pool.protocol_fee_percent; v_lp:=v_fee-v_protocol; v_net:=p_gems-v_fee;
  v_out:=v_pool.pieces_reserve-(v_pool.k_constant/(v_pool.currency_reserve+v_net));
  if v_out<=0 or v_out<p_min_pieces or v_out>=v_pool.pieces_reserve then raise exception 'Slippage or liquidity limit exceeded'; end if;
  v_before:=v_pool.currency_reserve/v_pool.pieces_reserve;
  perform public.post_economy_transaction(p_trader,'gems',-p_gems,'spend','piece_amm_buy',p_idempotency||':gems',p_pool,'piece_liquidity_pools','AMM Piece purchase','{}');
  perform public.adjust_piece_position(v_pool.piece_type,v_pool.asset_id,p_trader,v_out,v_before);
  update public.piece_liquidity_pools set pieces_reserve=pieces_reserve-v_out,currency_reserve=currency_reserve+v_net+v_lp,k_constant=(pieces_reserve-v_out)*(currency_reserve+v_net+v_lp),last_price=(currency_reserve+v_net+v_lp)/(pieces_reserve-v_out),volume_24h=volume_24h+p_gems,updated_at=now() where id=p_pool returning last_price into v_after;
  insert into public.piece_amm_swaps(pool_id,swap_type,trader_id,amount_in,amount_out,swap_fee,protocol_fee,lp_fee,price_before,price_after,price_impact_percent,expected_amount_out,minimum_amount_out,slippage_percent,status,transaction_hash,completed_at)
    values(p_pool,'currency_to_pieces',p_trader,p_gems,v_out,v_fee,v_protocol,v_lp,v_before,v_after,abs((v_after-v_before)/v_before*100),v_out,p_min_pieces,0,'completed',p_idempotency,now()) returning * into v_swap;
  insert into public.piece_settlement_ledger(settlement_type,piece_type,asset_id,user_id,reference_id,gems_amount,pieces_amount,idempotency_key,metadata)
    values('amm_swap',v_pool.piece_type,v_pool.asset_id,p_trader,v_swap.id,-p_gems,v_out,p_idempotency,jsonb_build_object('protocol_fee',v_protocol,'lp_fee',v_lp));
  update public.piece_fee_reserves set gems_balance=gems_balance+v_protocol,updated_at=now() where reserve_type='platform';
  return v_swap;
end $$;

create or replace function public.swap_pieces_for_gems(
  p_pool uuid,p_trader uuid,p_pieces numeric,p_min_gems numeric,p_idempotency text
) returns public.piece_amm_swaps language plpgsql security definer set search_path=public as $$
declare v_pool public.piece_liquidity_pools%rowtype; v_swap public.piece_amm_swaps%rowtype; v_gross numeric; v_fee numeric; v_protocol numeric; v_lp numeric; v_out numeric; v_before numeric; v_after numeric; v_enabled boolean;
begin
  select amm_enabled into v_enabled from public.piece_market_controls where singleton=true;
  if not v_enabled then raise exception 'AMM trading is suspended'; end if;
  select * into v_swap from public.piece_amm_swaps where transaction_hash=p_idempotency; if found then return v_swap; end if;
  select * into v_pool from public.piece_liquidity_pools where id=p_pool and status='active' for update;
  if not found or p_pieces<=0 then raise exception 'Pool unavailable'; end if;
  perform public.adjust_piece_position(v_pool.piece_type,v_pool.asset_id,p_trader,-p_pieces,v_pool.currency_reserve/v_pool.pieces_reserve);
  v_gross:=v_pool.currency_reserve-(v_pool.k_constant/(v_pool.pieces_reserve+p_pieces)); v_fee:=v_gross*v_pool.swap_fee_percent; v_protocol:=v_gross*v_pool.protocol_fee_percent; v_lp:=v_fee-v_protocol; v_out:=v_gross-v_fee;
  if v_out<=0 or v_out<p_min_gems or v_gross>=v_pool.currency_reserve then raise exception 'Slippage or liquidity limit exceeded'; end if;
  v_before:=v_pool.currency_reserve/v_pool.pieces_reserve;
  perform public.post_economy_transaction(p_trader,'gems',v_out,'earn','piece_amm_sale',p_idempotency||':gems',p_pool,'piece_liquidity_pools','AMM Piece sale','{}');
  update public.piece_liquidity_pools set pieces_reserve=pieces_reserve+p_pieces,currency_reserve=currency_reserve-v_out-v_protocol,k_constant=(pieces_reserve+p_pieces)*(currency_reserve-v_out-v_protocol),last_price=(currency_reserve-v_out-v_protocol)/(pieces_reserve+p_pieces),volume_24h=volume_24h+v_out,updated_at=now() where id=p_pool returning last_price into v_after;
  insert into public.piece_amm_swaps(pool_id,swap_type,trader_id,amount_in,amount_out,swap_fee,protocol_fee,lp_fee,price_before,price_after,price_impact_percent,expected_amount_out,minimum_amount_out,slippage_percent,status,transaction_hash,completed_at)
    values(p_pool,'pieces_to_currency',p_trader,p_pieces,v_out,v_fee,v_protocol,v_lp,v_before,v_after,abs((v_after-v_before)/v_before*100),v_out,p_min_gems,0,'completed',p_idempotency,now()) returning * into v_swap;
  insert into public.piece_settlement_ledger(settlement_type,piece_type,asset_id,user_id,reference_id,gems_amount,pieces_amount,idempotency_key,metadata)
    values('amm_swap',v_pool.piece_type,v_pool.asset_id,p_trader,v_swap.id,v_out,-p_pieces,p_idempotency,jsonb_build_object('protocol_fee',v_protocol,'lp_fee',v_lp));
  update public.piece_fee_reserves set gems_balance=gems_balance+v_protocol,updated_at=now() where reserve_type='platform';
  return v_swap;
end $$;

create or replace function public.claim_piece_dividends(p_holder uuid,p_ids uuid[] default null)
returns numeric language plpgsql security definer set search_path=public as $$
declare v_claim public.piece_dividend_claims%rowtype; v_total numeric:=0; v_enabled boolean;
begin
  select dividends_enabled into v_enabled from public.piece_market_controls where singleton=true;
  if not v_enabled then raise exception 'Piece distributions are suspended'; end if;
  for v_claim in select * from public.piece_dividend_claims where holder_id=p_holder and claim_status='unclaimed' and (p_ids is null or id=any(p_ids)) for update loop
    perform public.post_economy_transaction(p_holder,'gems',v_claim.dividend_amount,'earn','piece_distribution','piece-dividend:'||v_claim.id::text,v_claim.id,'piece_dividend_claims','Piece revenue distribution','{}');
    update public.piece_dividend_claims set claim_status='claimed',claimed_at=now() where id=v_claim.id;
    insert into public.piece_settlement_ledger(settlement_type,user_id,reference_id,gems_amount,idempotency_key)
      values('dividend',p_holder,v_claim.id,v_claim.dividend_amount,'piece-dividend:'||v_claim.id::text);
    v_total:=v_total+v_claim.dividend_amount;
  end loop;
  return v_total;
end $$;

create or replace view public.piece_supply_reconciliation as
with issued as (
  select piece_type,asset_id,sum(total_pieces_issued) issued from public.piece_issuances where issuance_status in ('active','closed') group by 1,2
), held as (
  select 'content'::public.piece_type piece_type,content_id asset_id,sum(pieces_owned) held from public.content_piece_positions group by 1,2
  union all select 'moment'::public.piece_type,moment_id,sum(pieces_owned) from public.moment_piece_positions group by 1,2
  union all select 'host'::public.piece_type,host_id,sum(pieces_owned) from public.host_piece_positions group by 1,2
  union all select 'venue'::public.piece_type,venue_id,sum(pieces_owned) from public.venue_piece_positions group by 1,2
), escrow as (
  select piece_type,asset_id,sum(quantity-released_quantity) escrowed from public.piece_escrow where status in ('held','partially_released') group by 1,2
), pools as (
  select piece_type,asset_id,sum(pieces_reserve) pooled from public.piece_liquidity_pools where status<>'closed' group by 1,2
)
select i.piece_type,i.asset_id,i.issued,coalesce(h.held,0) held,coalesce(e.escrowed,0) escrowed,coalesce(p.pooled,0) pooled,
  i.issued-coalesce(h.held,0)-coalesce(e.escrowed,0)-coalesce(p.pooled,0) difference
from issued i left join held h using(piece_type,asset_id) left join escrow e using(piece_type,asset_id) left join pools p using(piece_type,asset_id);

revoke all on function public.create_escrowed_piece_listing(public.piece_type,uuid,uuid,numeric,numeric,timestamptz) from public;
revoke all on function public.buy_piece_listing(uuid,uuid,numeric,text) from public;
revoke all on function public.cancel_piece_listing(uuid,uuid) from public;
revoke all on function public.swap_gems_for_pieces(uuid,uuid,numeric,numeric,text) from public;
revoke all on function public.swap_pieces_for_gems(uuid,uuid,numeric,numeric,text) from public;
revoke all on function public.claim_piece_dividends(uuid,uuid[]) from public;
grant execute on function public.create_escrowed_piece_listing(public.piece_type,uuid,uuid,numeric,numeric,timestamptz) to service_role;
grant execute on function public.buy_piece_listing(uuid,uuid,numeric,text) to service_role;
grant execute on function public.cancel_piece_listing(uuid,uuid) to service_role;
grant execute on function public.swap_gems_for_pieces(uuid,uuid,numeric,numeric,text) to service_role;
grant execute on function public.swap_pieces_for_gems(uuid,uuid,numeric,numeric,text) to service_role;
grant execute on function public.claim_piece_dividends(uuid,uuid[]) to service_role;
