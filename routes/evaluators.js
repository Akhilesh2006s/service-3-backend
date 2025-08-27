import express from 'express';
import bcrypt from 'bcryptjs';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get evaluators for the current trainer only
router.get('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const currentTrainerId = req.user._id;
    
    // Get evaluators that belong to this specific trainer
    const evaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: currentTrainerId 
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: evaluators
    });
  } catch (error) {
    console.error('Error fetching evaluators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluators'
    });
  }
});

// Add new evaluator for the current trainer
router.post('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    console.log('Evaluators POST - Request body:', req.body);
    console.log('Evaluators POST - Current trainer ID:', req.user._id);
    
    const { name, email, phone, password } = req.body;
    const currentTrainerId = req.user._id;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create evaluator
    const evaluator = new User({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      role: 'evaluator',
      trainerId: currentTrainerId,
      isVerified: true,
      isActive: true
    });

    await evaluator.save();

    // Return evaluator without password
    const evaluatorResponse = evaluator.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Evaluator added successfully',
      data: evaluatorResponse
    });
  } catch (error) {
    console.error('Error adding evaluator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add evaluator'
    });
  }
});

// Update evaluator status (only for evaluators belonging to current trainer)
router.patch('/:id/status', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentTrainerId = req.user._id;

    // Find evaluator and ensure it belongs to current trainer
    const evaluator = await User.findOne({ 
      _id: id, 
      role: 'evaluator', 
      trainerId: currentTrainerId 
    });

    if (!evaluator) {
      return res.status(404).json({
        success: false,
        message: 'Evaluator not found or not authorized'
      });
    }

    // Update status
    evaluator.isActive = isActive;
    await evaluator.save();

    // Return updated evaluator without password
    const evaluatorResponse = evaluator.getPublicProfile();

    res.json({
      success: true,
      message: `Evaluator ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: evaluatorResponse
    });
  } catch (error) {
    console.error('Error updating evaluator status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update evaluator status'
    });
  }
});

// Remove evaluator (only for evaluators belonging to current trainer)
router.delete('/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const currentTrainerId = req.user._id;

    // Find evaluator and ensure it belongs to current trainer
    const evaluator = await User.findOne({ 
      _id: id, 
      role: 'evaluator', 
      trainerId: currentTrainerId 
    });

    if (!evaluator) {
      return res.status(404).json({
        success: false,
        message: 'Evaluator not found or not authorized'
      });
    }

    // Soft delete by updating status
    evaluator.isActive = false;
    evaluator.trainerId = null;
    await evaluator.save();

    res.json({
      success: true,
      message: 'Evaluator removed successfully'
    });
  } catch (error) {
    console.error('Error removing evaluator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove evaluator'
    });
  }
});

// Get evaluator statistics for current trainer
router.get('/stats', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const currentTrainerId = req.user._id;
    
    // Get evaluators for this trainer
    const evaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: currentTrainerId 
    });

    const stats = {
      total: evaluators.length,
      active: evaluators.filter(e => e.isActive).length,
      inactive: evaluators.filter(e => !e.isActive).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching evaluator stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluator statistics'
    });
  }
});

export default router; 