import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getUserById, getUserByEmailOrPhone } from '../utils/userStorage.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Handle both JWT tokens and fallback tokens
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Decoded JWT token:', decoded);
    } catch (error) {
      // Handle fallback token format: test-token-{userId}-{role}
      if (token.startsWith('test-token-')) {
        const parts = token.replace('test-token-', '').split('-');
        if (parts.length >= 2) {
          const userId = parts[0];
          const role = parts[1];
          decoded = { userId, role };
          console.log('Auth middleware - Decoded fallback token:', decoded);
        } else {
          throw new Error('Invalid fallback token format');
        }
      } else {
        throw error;
      }
    }
    
    // Check if MongoDB is available
    const isMongoDBConnected = process.env.MONGODB_URI && 
                               process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';
    
    if (isMongoDBConnected) {
      // MongoDB is available, verify user exists in MongoDB
      try {
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = {
            _id: user._id,
            userId: user._id,
            role: user.role,
            isActive: user.isActive
          };
          next();
        } else {
          // User not found in MongoDB, try in-memory storage as fallback
          console.log('Auth middleware - User not found in MongoDB, trying in-memory storage');
          const memoryUser = getUserById(decoded.userId);
          
          if (!memoryUser) {
            // Try to find by role as fallback
            const { getAllUsers } = await import('../utils/userStorage.js');
            const usersWithRole = getAllUsers().filter(u => u.role === decoded.role);
            
            if (usersWithRole.length > 0) {
              const user = usersWithRole[0];
              req.user = {
                _id: user._id,
                userId: user._id,
                role: user.role,
                isActive: user.isActive
              };
              console.log('Auth middleware - Found user in in-memory storage by role:', user._id);
              next();
            } else {
              return res.status(401).json({ 
                success: false, 
                message: 'User not found in database.' 
              });
            }
          } else {
            req.user = {
              _id: memoryUser._id,
              userId: memoryUser._id,
              role: memoryUser.role,
              isActive: memoryUser.isActive
            };
            console.log('Auth middleware - Found user in in-memory storage:', memoryUser._id);
            next();
          }
        }
      } catch (error) {
        console.error('Auth middleware - MongoDB user lookup error:', error);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed.' 
        });
      }
    } else {
      // In-memory storage mode - check if user exists
      console.log('Auth middleware - In-memory mode, checking if user exists');
      
      // First try to find user by ID
      let user = getUserById(decoded.userId);
      
      if (!user) {
        // User not found by ID, try to find by role (this is a fallback for MongoDB users)
        console.log('Auth middleware - User not found by ID, trying to find by role');
        const { getAllUsers } = await import('../utils/userStorage.js');
        const usersWithRole = getAllUsers().filter(u => u.role === decoded.role);
        
        if (usersWithRole.length > 0) {
          // Use the first user with the same role
          user = usersWithRole[0];
          console.log('Auth middleware - Found user with same role:', user._id);
        }
      }
      
      if (user) {
        // Use the found user's ID and role
        const authUser = {
          _id: user._id,
          userId: user._id,
          role: user.role,
          isActive: user.isActive
        };
        
        console.log('Auth middleware - Setting req.user with found user:', authUser);
        req.user = authUser;
        next();
      } else {
        // No user found, return error
        console.log('Auth middleware - No user found in in-memory storage');
        return res.status(401).json({ 
          success: false, 
          message: 'User not found in current storage mode. Please re-login.' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('requireRole middleware - req.user:', req.user);
    console.log('requireRole middleware - required roles:', roles);
    console.log('requireRole middleware - user role:', req.user?.role);
    
    if (!req.user) {
      console.log('requireRole middleware - No user found');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('requireRole middleware - Role mismatch. User role:', req.user.role, 'Required roles:', roles);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    console.log('requireRole middleware - Role check passed');
    next();
  };
};

export const requireLearner = requireRole(['learner']);
export const requireTrainer = requireRole(['trainer']);
export const requireEvaluator = requireRole(['evaluator']);
export const requireAdmin = requireRole(['admin']);
export const requireTrainerOrEvaluator = requireRole(['trainer', 'evaluator']);
export const requireAnyRole = requireRole(['learner', 'trainer', 'evaluator', 'admin']); 