const express = require('express');
const router = express.Router();

// Mock auth middleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mock-user-id', email: 'user@example.com' };
  next();
};

// Apply auth to all routes
router.use(authMiddleware);

// Get user data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock user data (replace with real database query)
    const user = {
      id,
      username: `user_${id}`,
      email: `user${id}@example.com`,
      createdAt: new Date().toISOString(),
      stats: {
        posts: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500)
      }
    };

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Get current user
router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock user update (replace with real database update)
    res.json({
      success: true,
      user: { id, ...updates },
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Follow/unfollow user
router.post('/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'follow' or 'unfollow'

    // Mock follow action (replace with real database operation)
    res.json({
      success: true,
      action,
      message: `Successfully ${action}ed user ${id}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update follow status'
    });
  }
});

module.exports = router;
