-- =====================================================
-- PROMORANG INTELLIGENCE HUB (BLOG ENGINE)
-- Consolidated Schema + Performance Indexing + Seed Posts
-- =====================================================

-- 1. Ensure uuid-ossp is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50), -- Lucide icon name
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    content_json JSONB,
    
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    platform_tags VARCHAR(50)[] DEFAULT '{}',
    
    featured_image TEXT,
    thumbnail_image TEXT,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    
    view_count INTEGER DEFAULT 0,
    relay_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Search Optimization
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN (to_tsvector('english', title || ' ' || summary || ' ' || content));

-- 5. RPC Functions
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Seed Categories
INSERT INTO blog_categories (name, slug, description, icon_name)
VALUES 
    ('News', 'news', 'Latest platform updates and world news', 'Newspaper'),
    ('Guides', 'guides', 'Educational content and how-tos', 'BookOpen'),
    ('Marketplace', 'marketplace', 'Shopify and e-commerce insights', 'ShoppingBag'),
    ('Social Strategy', 'strategy', 'Viral growth and engagement tips', 'TrendingUp'),
    ('Announcements', 'announcements', 'Internal Promorang feature launches', 'Megaphone')
ON CONFLICT (slug) DO NOTHING;

-- 7. Seed Posts (Wrapped in DO block for category IDs)
DO $$
DECLARE
    news_cat UUID;
    market_cat UUID;
    strat_cat UUID;
BEGIN
    SELECT id INTO news_cat FROM blog_categories WHERE slug = 'news';
    SELECT id INTO market_cat FROM blog_categories WHERE slug = 'marketplace';
    SELECT id INTO strat_cat FROM blog_categories WHERE slug = 'strategy';
    
    INSERT INTO blog_posts (title, slug, summary, content, category_id, platform_tags, featured_image, status, published_at, seo_title, seo_description)
    VALUES 
    (
        'The TikTok 2026 Algorithm Shift: Why Watch Time Isn''t Enough Anymore',
        'tiktok-2026-algorithm-shift',
        'TikTok has updated its recommendation engine to prioritize "Propagation Lineage". Learn how to optimize for depth.',
        '<h2>The End of Passive Viewing</h2><p>In 2026, TikTok weights <strong>propagation depth</strong> higher than watch time. Focus on sharing patterns.</p>',
        strat_cat,
        ARRAY['tiktok', 'viral'],
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format',
        'published',
        NOW(),
        'TikTok 2026 Algorithm Guide',
        'Master the new TikTok algorithm shift prioritizing propagation depth.'
    ),
    (
        'Shopify ROI 2.0: Moving Beyond Last-Click Attribution',
        'shopify-roi-attribution-guide',
        'Discover how merchants are using Promorang to track the full viral journey of a sale.',
        '<h2>The Attribution Gap</h2><p>Traditional analytics fail to capture "dark social". Promorang assigns lineage tokens to every relay.</p>',
        market_cat,
        ARRAY['shopify', 'ecommerce'],
        'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1000&auto=format',
        'published',
        NOW(),
        'Shopify Social ROI Guide 2026',
        'Track full-funnel social media attribution for your Shopify store.'
    )
    ON CONFLICT (slug) DO NOTHING;
END $$;
