const express = require('express');
const router = express.Router();
const blogService = require('../services/blogService');

/**
 * @route GET /api/blog
 * @desc Get all published blog posts
 */
router.get('/', async (req, res) => {
    try {
        const { category, platform, limit, offset, search } = req.query;
        const result = await blogService.getPosts({
            category,
            platform,
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            search
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

/**
 * @route GET /api/blog/categories
 * @desc Get all blog categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await blogService.getCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

/**
 * @route GET /api/blog/:slug
 * @desc Get a single blog post by slug
 */
router.get('/:slug', async (req, res) => {
    try {
        const post = await blogService.getPostBySlug(req.params.slug);

        // Track view asynchronously
        blogService.trackView(post.id).catch(err => console.error('Error tracking view:', err));

        res.json(post);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

/**
 * @route GET /api/blog/:slug/related
 * @desc Get related posts for an article
 */
router.get('/:slug/related', async (req, res) => {
    try {
        const post = await blogService.getPostBySlug(req.params.slug);
        const related = await blogService.getRelatedPosts(post.id, post.category_id);
        res.json(related);
    } catch (error) {
        console.error('Error fetching related posts:', error);
        res.status(500).json({ error: 'Failed to fetch related posts' });
    }
});

module.exports = router;
