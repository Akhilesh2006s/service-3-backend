import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { 
  getAllUsers, 
  getUserByEmailOrPhone, 
  addUser, 
  updateUser,
  getUserById
} from '../utils/userStorage.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Only allow trainer registration
    if (role !== 'trainer') {
      return res.status(400).json({
        success: false,
        message: 'Only Telugu trainers can register for this platform'
      });
    }

    // Check if MongoDB is available and properly configured
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';
    
    if (isMongoDBConnected && hasValidMongoURI) {
      // Use MongoDB
      console.log('Using MongoDB for user registration');
      
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }

      // Create user in MongoDB
      const user = new User({
        name,
        email,
        phone,
        password, // Will be hashed by pre-save hook
        role,
        isVerified: true,
        isActive: true
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully in MongoDB',
        data: {
          user: userResponse,
          token
        }
      });
    } else {
      // Fallback to in-memory storage
      console.log('MongoDB not available, using in-memory storage');
      
      // Check if user already exists
      const existingUser = getUserByEmailOrPhone(email, phone);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const userId = Date.now().toString();
      const user = {
        _id: userId,
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addUser(user);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Return user without password
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully (local storage)',
        data: {
          user: userResponse,
          token
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if MongoDB is available and properly configured
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';
    
    if (isMongoDBConnected && hasValidMongoURI) {
      // Use MongoDB
      console.log('Using MongoDB for user login');
      
      // Find user by email in MongoDB
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful (MongoDB)',
        data: {
          user: userResponse,
          token
        }
      });
    } else {
      // Fallback to in-memory storage
      console.log('MongoDB not available, using in-memory storage for login');
      
      // Find user by email
      const user = getUserByEmailOrPhone(email, null);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Return user without password
      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful (local storage)',
        data: {
          user: userResponse,
          token
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('GET /me - User from auth middleware:', req.user);
    
    // Check if MongoDB is available and properly configured
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';

    // Check if the user ID is a valid MongoDB ObjectId (24 character hex string)
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };
    
    // Use MongoDB only if connected AND user ID is valid ObjectId
    if (isMongoDBConnected && hasValidMongoURI && isValidObjectId(req.user._id)) {
      // For MongoDB storage
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } else {
      // For in-memory storage, return the user from auth middleware
      console.log('Using in-memory storage for /me endpoint');
      const user = getUserById(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        data: userResponse
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const user = await updateUser(req.user._id, updates);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would:
    // 1. Save the reset token to the user document
    // 2. Send an email/SMS with the reset link
    // 3. Create a reset password endpoint

    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Password reset instructions have been sent',
      data: {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router; 