const express = require('express');
const router = express.Router();

// Mock auth middleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mock-user-id', email: 'user@example.com' };
  next();
};

// Apply auth to protected routes
router.use(authMiddleware);

// Get all content
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    // Mock content data (replace with real database query)
    const content = Array.from({ length: limit }, (_, i) => ({
      id: `content_${i + 1}`,
      title: `Sample Content ${i + 1}`,
      description: `This is sample content description ${i + 1}`,
      type: type || 'post',
      author: {
        id: 'user_1',
        username: 'sample_user',
        avatar: 'https://via.placeholder.com/40'
      },
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: i % 2 === 0 ? ['https://via.placeholder.com/300x200'] : []
    }));

    res.json({
      success: true,
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 100,
        pages: Math.ceil(100 / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    });
  }
});

// Get single content item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock content item (replace with real database query)
    const content = {
      id,
      title: `Content Item ${id}`,
      description: `This is the full description for content item ${id}`,
      type: 'post',
      author: {
        id: 'user_1',
        username: 'sample_user',
        avatar: 'https://via.placeholder.com/40'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      media: ['https://via.placeholder.com/600x400'],
      tags: ['sample', 'content', 'api']
    };

    res.json({
      success: true,
      content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content item'
    });
  }
});

// Create new content
router.post('/', async (req, res) => {
  try {
    const { title, description, type, media, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    // Mock content creation (replace with real database insert)
    const newContent = {
      id: `content_${Date.now()}`,
      title,
      description,
      type: type || 'post',
      author: req.user,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      media: media || [],
      tags: tags || []
    };

    res.status(201).json({
      success: true,
      content: newContent,
      message: 'Content created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create content'
    });
  }
});

// Update content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock content update (replace with real database update)
    res.json({
      success: true,
      content: { id, ...updates, updatedAt: new Date().toISOString() },
      message: 'Content updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update content'
    });
  }
});

// Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock content deletion (replace with real database delete)
    res.json({
      success: true,
      message: `Content ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete content'
    });
  }
});

// Like/Unlike content
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    // Mock like action (replace with real database operation)
    res.json({
      success: true,
      action,
      message: `Content ${id} ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update like status'
    });
  }
});

module.exports = router;
