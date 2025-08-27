import express from 'express';
import bcrypt from 'bcryptjs';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get students for the current trainer only
router.get('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const currentTrainerId = req.user._id;
    
    // Get students that belong to this specific trainer
    const students = await User.find({ 
      role: 'learner', 
      trainerId: currentTrainerId 
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Add new student for the current trainer
router.post('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
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

    // Create student
    const student = new User({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      role: 'learner',
      trainerId: currentTrainerId,
      isVerified: true,
      isActive: true
    });

    await student.save();

    // Return student without password
    const studentResponse = student.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: studentResponse
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student'
    });
  }
});

// Update student status (only for students belonging to current trainer)
router.patch('/:id/status', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentTrainerId = req.user._id;

    // Find student and ensure it belongs to current trainer
    const student = await User.findOne({ 
      _id: id, 
      role: 'learner', 
      trainerId: currentTrainerId 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not authorized'
      });
    }

    // Update status
    student.isActive = isActive;
    await student.save();

    // Return updated student without password
    const studentResponse = student.getPublicProfile();

    res.json({
      success: true,
      message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: studentResponse
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student status'
    });
  }
});

// Remove student (only for students belonging to current trainer)
router.delete('/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const currentTrainerId = req.user._id;

    // Find student and ensure it belongs to current trainer
    const student = await User.findOne({ 
      _id: id, 
      role: 'learner', 
      trainerId: currentTrainerId 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not authorized'
      });
    }

    // Soft delete by updating status
    student.isActive = false;
    student.trainerId = null;
    await student.save();

    res.json({
      success: true,
      message: 'Student removed successfully'
    });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student'
    });
  }
});

// Get student statistics for current trainer
router.get('/stats', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const currentTrainerId = req.user._id;
    
    // Get students for this trainer
    const students = await User.find({ 
      role: 'learner', 
      trainerId: currentTrainerId 
    });

    const stats = {
      total: students.length,
      active: students.filter(s => s.isActive).length,
      inactive: students.filter(s => !s.isActive).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student statistics'
    });
  }
});

export default router; 