const express = require('express');
const router = express.Router();

// Mock authentication middleware (replace with real auth later)
const authMiddleware = (req, res, next) => {
  // For now, just pass through - implement real auth later
  req.user = { id: 'mock-user-id', email: 'user@example.com' };
  next();
};

// Public routes
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock authentication (replace with real auth)
    if (email && password) {
      res.json({
        success: true,
        user: { id: 'mock-user-id', email },
        token: 'mock-jwt-token'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Mock registration (replace with real registration)
    if (email && password && username) {
      res.json({
        success: true,
        user: { id: 'mock-user-id', email, username },
        message: 'Registration successful'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Email, password, and username required'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Protected routes
router.use(authMiddleware);

router.get('/profile', (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;

    // Mock profile update (replace with real database update)
    res.json({
      success: true,
      user: { ...req.user, ...updates },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Profile update failed'
    });
  }
});

module.exports = router;
