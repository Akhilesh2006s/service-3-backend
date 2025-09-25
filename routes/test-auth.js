import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Test login endpoint - for development/testing only
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple test credentials
    if (email === 'learner@test.com' && password === 'password123') {
      const token = jwt.sign(
        { userId: 'test-user-123', role: 'learner' },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Test login successful',
        data: {
          token,
          user: {
            id: 'test-user-123',
            name: 'Test Learner',
            email: 'learner@test.com',
            role: 'learner'
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid test credentials. Use email: learner@test.com, password: password123'
      });
    }
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Test login failed'
    });
  }
});

export default router;
