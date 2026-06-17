CREATE OR REPLACE VIEW public.view_public_reward_directory AS
SELECT
  uc.id,
  uc.code,
  uc.name,
  uc.description,
  uc.discount_type,
  uc.discount_value,
  uc.max_uses,
  uc.current_uses,
  uc.expires_at,
  uc.is_active,
  uc.source_type,
  uc.system,
  uc.campaign_id,
  uc.drop_id,
  uc.store_id,
  uc.advertiser_id,
  vp.slug AS venue_slug,
  vp.name AS venue_name,
  vp.city,
  vp.country,
  o.slug AS brand_slug,
  o.name AS brand_name
FROM public.unified_coupons uc
LEFT JOIN public.venue_profiles vp
  ON vp.id = uc.store_id
LEFT JOIN public.organizations o
  ON o.id = uc.advertiser_id
WHERE uc.is_active = true
  AND (uc.expires_at IS NULL OR uc.expires_at >= now());

GRANT SELECT ON public.view_public_reward_directory TO anon, authenticated;

COMMENT ON VIEW public.view_public_reward_directory IS 'Public reward discovery view combining active coupon-style rewards with linked venue and brand context.';

notify pgrst, 'reload schema';
