import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

const testLearnerAuth = async () => {
  try {
    await connectDB();
    
    // Test the specific user ID from the frontend logs
    const userId = '68983401de107c0a6acae2cf';
    console.log('🔍 Testing user ID:', userId);
    
    // Check if user exists in MongoDB
    const user = await User.findById(userId);
    if (user) {
      console.log('✅ User found in MongoDB:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      console.log('❌ User not found in MongoDB');
    }
    
    // Test the JWT token from frontend
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODk4MzQwMWRlMTA3YzBhNmFjYWUyY2YiLCJyb2xlIjoibGVhcm5lciIsImlhdCI6MTc1NDg1NjIyOCwiZXhwIjoxNzU1NDYxMDI4fQ.r5JvkJJ8LTi69y1hMvq4DO4RvjcToiw279v21jBfg7I';
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT token decoded successfully:', decoded);
      
      // Check if the decoded user ID matches
      if (decoded.userId === userId) {
        console.log('✅ User ID in token matches');
      } else {
        console.log('❌ User ID mismatch:', { tokenUserId: decoded.userId, expectedUserId: userId });
      }
      
      // Check if role is correct
      if (decoded.role === 'learner') {
        console.log('✅ Role in token is correct: learner');
      } else {
        console.log('❌ Role mismatch:', { tokenRole: decoded.role, expectedRole: 'learner' });
      }
      
    } catch (error) {
      console.log('❌ JWT token verification failed:', error.message);
    }
    
    // List all users to see what's available
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('_id name email role isActive');
    allUsers.forEach(user => {
      console.log(`- ${user._id}: ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
    });
    
    // Check for learners specifically
    console.log('\n🎓 All learners in database:');
    const learners = await User.find({ role: 'learner' }).select('_id name email role isActive');
    learners.forEach(user => {
      console.log(`- ${user._id}: ${user.name} (${user.email}) - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

testLearnerAuth();

