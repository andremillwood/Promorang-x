-- Phase 32: Advanced Analytics & Reporting
-- Date: 2026-02-04
-- Purpose: Create analytics views and aggregation functions for comprehensive reporting

-- ============================================================================
-- 0. Ensure Required Columns Exist
-- ============================================================================

-- Ensure merchant_products has all required columns (from Phase 29)
ALTER TABLE merchant_products
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_points INTEGER,
ADD COLUMN IF NOT EXISTS inventory_count INTEGER,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS total_redemptions INTEGER DEFAULT 0;

-- ============================================================================
-- 1. Merchant Sales Analytics View
-- ============================================================================

CREATE OR REPLACE VIEW merchant_sales_analytics AS
SELECT
  mp.merchant_id,
  mp.category,
  DATE_TRUNC('day', ps.created_at) AS sale_date,
  COUNT(ps.id) AS total_sales,
  SUM(CASE WHEN ps.sale_type = 'cash' THEN ps.amount_paid ELSE 0 END) AS cash_revenue,
  SUM(CASE WHEN ps.sale_type = 'points' THEN ps.points_paid ELSE 0 END) AS points_redeemed,
  SUM(CASE WHEN ps.sale_type = 'redemption' THEN 1 ELSE 0 END) AS entitlement_redemptions,
  COUNT(DISTINCT ps.user_id) AS unique_customers,
  AVG(ps.amount_paid) AS avg_order_value,
  COUNT(CASE WHEN ps.status = 'validated' THEN 1 END) AS validated_sales,
  COUNT(CASE WHEN ps.status = 'pending' THEN 1 END) AS pending_sales
FROM merchant_products mp
LEFT JOIN product_sales ps ON mp.id = ps.product_id
GROUP BY mp.merchant_id, mp.category, DATE_TRUNC('day', ps.created_at);

COMMENT ON VIEW merchant_sales_analytics IS 'Daily sales analytics by merchant and category';

-- ============================================================================
-- 2. Product Performance View
-- ============================================================================

CREATE OR REPLACE VIEW product_performance_analytics AS
SELECT
  mp.id AS product_id,
  mp.merchant_id,
  mp.name AS product_name,
  mp.category,
  mp.price_usd,
  mp.price_points,
  COUNT(ps.id) AS total_sales,
  SUM(ps.amount_paid) AS total_revenue,
  SUM(ps.points_paid) AS total_points,
  COUNT(DISTINCT ps.user_id) AS unique_buyers,
  AVG(ps.amount_paid) AS avg_sale_price,
  COUNT(CASE WHEN ps.status = 'validated' THEN 1 END) AS redemption_rate,
  mp.inventory_count,
  mp.total_redemptions,
  CASE 
    WHEN mp.inventory_count IS NOT NULL AND mp.inventory_count <= mp.low_stock_threshold 
    THEN true 
    ELSE false 
  END AS is_low_stock
FROM merchant_products mp
LEFT JOIN product_sales ps ON mp.id = ps.product_id
GROUP BY mp.id, mp.merchant_id, mp.name, mp.category, mp.price_usd, mp.price_points, 
         mp.inventory_count, mp.total_redemptions, mp.low_stock_threshold;

COMMENT ON VIEW product_performance_analytics IS 'Performance metrics for each product';

-- ============================================================================
-- 3. Brand Campaign Analytics View
-- ============================================================================

CREATE OR REPLACE VIEW brand_campaign_analytics AS
SELECT 
  c.id AS campaign_id,
  c.advertiser_id AS brand_id,
  c.name AS campaign_name,
  c.budget_total AS budget_usd,
  c.status,
  COUNT(DISTINCT cs.moment_id) AS moments_sponsored,
  COUNT(DISTINCT m.organizer_id) AS unique_hosts,
  SUM(cs.sponsorship_amount) AS total_spent,
  COUNT(DISTINCT r.user_id) AS total_participants,
  COUNT(DISTINCT r.id) AS total_redemptions,
  CASE 
    WHEN COUNT(DISTINCT cs.moment_id) > 0 
    THEN COUNT(DISTINCT r.user_id)::DECIMAL / COUNT(DISTINCT cs.moment_id)
    ELSE 0
  END AS avg_participants_per_moment,
  SUM(mep.total_amount_usd) AS total_escrow_distributed,
  CASE 
    WHEN SUM(cs.sponsorship_amount) > 0 
    THEN COUNT(DISTINCT r.user_id)::DECIMAL / SUM(cs.sponsorship_amount) 
    ELSE 0 
  END AS cost_per_participant,
  c.created_at,
  c.start_date AS starts_at,
  c.end_date AS ends_at
FROM campaigns c
LEFT JOIN campaign_sponsorships cs ON c.id = cs.campaign_id
LEFT JOIN moments m ON cs.moment_id = m.id
LEFT JOIN redemptions r ON m.id = r.moment_id AND r.redeemed_at IS NOT NULL
LEFT JOIN moment_escrow_pools mep ON m.id = mep.moment_id
GROUP BY c.id, c.advertiser_id, c.name, c.budget_total, c.status, 
         c.created_at, c.start_date, c.end_date;

COMMENT ON VIEW brand_campaign_analytics IS 'Campaign performance metrics for brands';

-- ============================================================================
-- 4. Host Earnings Analytics View
-- ============================================================================

CREATE OR REPLACE VIEW host_earnings_analytics AS
SELECT
  u.id AS host_id,
  u.email AS host_email,
  COUNT(DISTINCT m.id) AS total_moments,
  SUM(mep.total_amount_usd) AS total_rewards_distributed,
  COUNT(DISTINCT r.user_id) AS total_participants,
  CASE 
    WHEN COUNT(DISTINCT m.id) > 0 
    THEN COUNT(DISTINCT r.user_id)::DECIMAL / COUNT(DISTINCT m.id)
    ELSE 0
  END AS avg_participants_per_moment,
  COUNT(DISTINCT cs.campaign_id) AS campaigns_participated,
  SUM(cs.sponsorship_amount) AS total_sponsorship_received,
  MAX(m.created_at) AS last_moment_date,
  COUNT(CASE WHEN m.status = 'active' THEN 1 END) AS active_moments,
  COUNT(CASE WHEN m.status = 'closed' THEN 1 END) AS completed_moments
FROM auth.users u
LEFT JOIN moments m ON u.id = m.organizer_id
LEFT JOIN redemptions r ON m.id = r.moment_id
LEFT JOIN campaign_sponsorships cs ON m.id = cs.moment_id
LEFT JOIN moment_escrow_pools mep ON m.id = mep.moment_id
GROUP BY u.id, u.email;

COMMENT ON VIEW host_earnings_analytics IS 'Earnings and performance metrics for hosts';

-- ============================================================================
-- 5. Moment Performance View
-- ============================================================================

CREATE OR REPLACE VIEW moment_performance_analytics AS
SELECT
  m.id AS moment_id,
  m.title,
  m.organizer_id AS host_id,
  m.status,
  COUNT(DISTINCT r.user_id) AS participant_count,
  mep.total_amount_usd AS reward_pool_usd,
  COUNT(DISTINCT r.id) AS total_redemptions,
  COUNT(DISTINCT r.user_id) AS unique_participants,
  COUNT(DISTINCT e.id) AS total_entitlements,
  COUNT(DISTINCT mp.id) AS linked_products,
  SUM(ps.amount_paid) AS product_revenue_generated,
  COUNT(DISTINCT cs.campaign_id) AS sponsoring_campaigns,
  SUM(cs.sponsorship_amount) AS total_sponsorship,
  m.created_at,
  m.starts_at,
  m.ends_at
FROM moments m
LEFT JOIN redemptions r ON m.id = r.moment_id
LEFT JOIN entitlements e ON m.id = e.moment_id
LEFT JOIN merchant_products mp ON mp.linked_moment_id = m.id
LEFT JOIN product_sales ps ON mp.id = ps.product_id AND ps.sale_type = 'redemption'
LEFT JOIN campaign_sponsorships cs ON m.id = cs.moment_id
LEFT JOIN moment_escrow_pools mep ON m.id = mep.moment_id
GROUP BY m.id, m.title, m.organizer_id, m.status, mep.total_amount_usd,
         m.created_at, m.starts_at, m.ends_at;

COMMENT ON VIEW moment_performance_analytics IS 'Performance metrics for individual moments';

-- ============================================================================
-- 6. Redemption Analytics View
-- ============================================================================

CREATE OR REPLACE VIEW redemption_analytics AS
SELECT
  DATE_TRUNC('day', ps.created_at) AS redemption_date,
  mp.merchant_id,
  mp.category,
  COUNT(ps.id) AS total_redemptions,
  COUNT(CASE WHEN ps.status = 'validated' THEN 1 END) AS validated_count,
  COUNT(CASE WHEN ps.status = 'pending' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN ps.sale_type = 'redemption' THEN 1 END) AS entitlement_redemptions,
  COUNT(CASE WHEN ps.sale_type = 'points' THEN 1 END) AS points_purchases,
  COUNT(CASE WHEN ps.sale_type = 'cash' THEN 1 END) AS cash_purchases,
  AVG(EXTRACT(EPOCH FROM (ps.validated_at - ps.created_at))/3600) AS avg_hours_to_validate,
  COUNT(DISTINCT ps.user_id) AS unique_users
FROM product_sales ps
JOIN merchant_products mp ON ps.product_id = mp.id
WHERE ps.redemption_code IS NOT NULL
GROUP BY DATE_TRUNC('day', ps.created_at), mp.merchant_id, mp.category;

COMMENT ON VIEW redemption_analytics IS 'Daily redemption metrics by merchant and category';

-- ============================================================================
-- 7. Platform Economy Health View
-- ============================================================================

CREATE OR REPLACE VIEW platform_economy_health AS
SELECT
  DATE_TRUNC('day', created_at) AS metric_date,
  'points_redeemed' AS metric_type,
  SUM(points_paid) AS value
FROM product_sales
WHERE sale_type = 'points'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT
  DATE_TRUNC('day', created_at) AS metric_date,
  'cash_revenue' AS metric_type,
  SUM(amount_paid) AS value
FROM product_sales
WHERE sale_type = 'cash'
GROUP BY DATE_TRUNC('day', created_at)

UNION ALL

SELECT
  DATE_TRUNC('day', created_at) AS metric_date,
  'moments_created' AS metric_type,
  COUNT(*) AS value
FROM moments
GROUP BY DATE_TRUNC('day', created_at);

COMMENT ON VIEW platform_economy_health IS 'Daily platform economy metrics';

-- ============================================================================
-- 8. Customer Segmentation View
-- ============================================================================

CREATE OR REPLACE VIEW customer_segmentation AS
SELECT
  ps.user_id,
  COUNT(DISTINCT ps.id) AS total_purchases,
  SUM(ps.amount_paid) AS lifetime_value,
  SUM(ps.points_paid) AS total_points_spent,
  COUNT(DISTINCT mp.merchant_id) AS merchants_visited,
  COUNT(DISTINCT mp.category) AS categories_purchased,
  MIN(ps.created_at) AS first_purchase_date,
  MAX(ps.created_at) AS last_purchase_date,
  EXTRACT(EPOCH FROM (MAX(ps.created_at) - MIN(ps.created_at)))/86400 AS customer_lifetime_days,
  CASE
    WHEN COUNT(ps.id) >= 10 THEN 'VIP'
    WHEN COUNT(ps.id) >= 5 THEN 'Regular'
    WHEN COUNT(ps.id) >= 2 THEN 'Occasional'
    ELSE 'New'
  END AS customer_segment,
  CASE
    WHEN MAX(ps.created_at) > NOW() - INTERVAL '30 days' THEN 'Active'
    WHEN MAX(ps.created_at) > NOW() - INTERVAL '90 days' THEN 'At Risk'
    ELSE 'Churned'
  END AS engagement_status
FROM product_sales ps
JOIN merchant_products mp ON ps.product_id = mp.id
GROUP BY ps.user_id;

COMMENT ON VIEW customer_segmentation IS 'Customer segmentation based on purchase behavior';

-- ============================================================================
-- 9. Indexes for Performance
-- ============================================================================

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_product_sales_created_at
ON product_sales(created_at);

CREATE INDEX IF NOT EXISTS idx_product_sales_merchant_created
ON product_sales(merchant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_product_sales_status_type
ON product_sales(status, sale_type);

CREATE INDEX IF NOT EXISTS idx_moments_organizer_status
ON moments(organizer_id, status);

-- ============================================================================
-- 10. Aggregation Functions
-- ============================================================================

-- Function: Get merchant sales summary
CREATE OR REPLACE FUNCTION get_merchant_sales_summary(
  p_merchant_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  total_sales BIGINT,
  total_revenue DECIMAL,
  total_points BIGINT,
  unique_customers BIGINT,
  avg_order_value DECIMAL,
  top_category TEXT,
  validation_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(ps.id)::BIGINT AS total_sales,
    SUM(ps.amount_paid)::DECIMAL AS total_revenue,
    SUM(ps.points_paid)::BIGINT AS total_points,
    COUNT(DISTINCT ps.user_id)::BIGINT AS unique_customers,
    AVG(ps.amount_paid)::DECIMAL AS avg_order_value,
    (SELECT mp2.category 
     FROM product_sales ps2 
     JOIN merchant_products mp2 ON ps2.product_id = mp2.id
     WHERE mp2.merchant_id = p_merchant_id
     GROUP BY mp2.category 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) AS top_category,
    (COUNT(CASE WHEN ps.status = 'validated' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(ps.id), 0) * 100)::DECIMAL AS validation_rate
  FROM product_sales ps
  JOIN merchant_products mp ON ps.product_id = mp.id
  WHERE mp.merchant_id = p_merchant_id
    AND ps.created_at >= p_start_date
    AND ps.created_at <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function: Get campaign ROI
CREATE OR REPLACE FUNCTION get_campaign_roi(
  p_campaign_id UUID
)
RETURNS TABLE(
  total_spent DECIMAL,
  total_participants BIGINT,
  total_redemptions BIGINT,
  cost_per_participant DECIMAL,
  cost_per_redemption DECIMAL,
  roi_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(cs.sponsorship_amount)::DECIMAL AS total_spent,
    COUNT(DISTINCT r.user_id)::BIGINT AS total_participants,
    COUNT(DISTINCT r.id)::BIGINT AS total_redemptions,
    (SUM(cs.sponsorship_amount) / NULLIF(COUNT(DISTINCT r.user_id), 0))::DECIMAL AS cost_per_participant,
    (SUM(cs.sponsorship_amount) / NULLIF(COUNT(DISTINCT r.id), 0))::DECIMAL AS cost_per_redemption,
    ((COUNT(DISTINCT r.user_id)::DECIMAL * 10 - SUM(cs.sponsorship_amount)) / 
     NULLIF(SUM(cs.sponsorship_amount), 0) * 100)::DECIMAL AS roi_percentage
  FROM campaign_sponsorships cs
  LEFT JOIN moments m ON cs.moment_id = m.id
  LEFT JOIN redemptions r ON m.id = r.moment_id AND r.redeemed_at IS NOT NULL
  WHERE cs.campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get product cross-sell matrix
CREATE OR REPLACE FUNCTION get_product_cross_sell_matrix(
  p_merchant_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  product_a_id UUID,
  product_a_name TEXT,
  product_b_id UUID,
  product_b_name TEXT,
  co_purchase_count BIGINT,
  affinity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH purchase_pairs AS (
    SELECT 
      ps1.product_id AS product_a,
      ps2.product_id AS product_b,
      COUNT(DISTINCT ps1.user_id) AS pair_count
    FROM product_sales ps1
    JOIN product_sales ps2 ON ps1.user_id = ps2.user_id 
      AND ps1.product_id < ps2.product_id
    JOIN merchant_products mp1 ON ps1.product_id = mp1.id
    JOIN merchant_products mp2 ON ps2.product_id = mp2.id
    WHERE mp1.merchant_id = p_merchant_id
      AND mp2.merchant_id = p_merchant_id
    GROUP BY ps1.product_id, ps2.product_id
  )
  SELECT
    pp.product_a AS product_a_id,
    mp1.name AS product_a_name,
    pp.product_b AS product_b_id,
    mp2.name AS product_b_name,
    pp.pair_count AS co_purchase_count,
    (pp.pair_count::DECIMAL / 
     (SELECT COUNT(DISTINCT user_id) FROM product_sales ps 
      JOIN merchant_products mp ON ps.product_id = mp.id 
      WHERE mp.merchant_id = p_merchant_id) * 100)::DECIMAL AS affinity_score
  FROM purchase_pairs pp
  JOIN merchant_products mp1 ON pp.product_a = mp1.id
  JOIN merchant_products mp2 ON pp.product_b = mp2.id
  ORDER BY pp.pair_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 32: Advanced Analytics & Reporting migration completed successfully';
  RAISE NOTICE 'Created 8 analytics views';
  RAISE NOTICE 'Created 3 aggregation functions';
  RAISE NOTICE 'Added performance indexes';
END $$;
