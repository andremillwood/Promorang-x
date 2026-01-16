const { supabase } = require('../lib/supabase');

/**
 * Service for managing the Promorang Intelligence Hub (Blog Engine)
 */
const blogService = {
    /**
     * Get all published blog posts with optional filters
     */
    async getPosts({ category, platform, limit = 10, offset = 0, search = '' } = {}) {
        let query = supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories(*)
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (category) {
            query = query.eq('category_id', category);
        }

        if (platform) {
            query = query.contains('platform_tags', [platform]);
        }

        if (search) {
            query = query.textSearch('title_summary_content', search);
        }

        const { data, error, count } = await query
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { posts: data, total: count };
    },

    /**
     * Get a single post by slug
     */
    async getPostBySlug(slug) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                category:blog_categories(*)
            `)
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all categories
     */
    async getCategories() {
        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    /**
     * Increment view count for a post
     */
    async trackView(postId) {
        const { error } = await supabase.rpc('increment_blog_views', { post_id: postId });
        if (error) {
            // Fallback if RPC doesn't exist yet
            await supabase
                .from('blog_posts')
                .update({ view_count: supabase.sql`view_count + 1` })
                .eq('id', postId);
        }
    },

    /**
     * Get related posts
     */
    async getRelatedPosts(postId, categoryId, limit = 3) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('category_id', categoryId)
            .neq('id', postId)
            .eq('status', 'published')
            .limit(limit);

        if (error) throw error;
        return data;
    }
};

module.exports = blogService;
