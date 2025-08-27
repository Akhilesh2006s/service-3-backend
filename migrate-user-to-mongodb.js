import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getUserByEmailOrPhone } from './utils/userStorage.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

const migrateUser = async () => {
  console.log('Migrating in-memory user to MongoDB...\n');
  
  // Connect to MongoDB
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Get the learner user from in-memory storage
    const learnerEmail = 'amenityforges@gmail.com';
    const memoryUser = getUserByEmailOrPhone(learnerEmail, null);
    
    if (!memoryUser) {
      console.log('❌ Learner user not found in in-memory storage');
      return;
    }
    
    console.log('Found in-memory user:', {
      name: memoryUser.name,
      email: memoryUser.email,
      role: memoryUser.role,
      id: memoryUser._id
    });
    
    // Check if user already exists in MongoDB
    const User = mongoose.model('User');
    const existingUser = await User.findOne({ email: learnerEmail });
    
    if (existingUser) {
      console.log('✅ User already exists in MongoDB:', {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        id: existingUser._id
      });
      
      // Update the user to match the in-memory data
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          name: memoryUser.name,
          phone: memoryUser.phone,
          role: memoryUser.role,
          isVerified: memoryUser.isVerified,
          isActive: memoryUser.isActive
        },
        { new: true }
      );
      
      console.log('✅ User updated in MongoDB:', {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        id: updatedUser._id
      });
      
      return updatedUser;
    }
    
    // Create new user in MongoDB
    console.log('Creating new user in MongoDB...');
    
    const newUser = new User({
      name: memoryUser.name,
      email: memoryUser.email,
      phone: memoryUser.phone,
      password: memoryUser.password, // This should already be hashed
      role: memoryUser.role,
      isVerified: memoryUser.isVerified,
      isActive: memoryUser.isActive,
      createdAt: memoryUser.createdAt,
      updatedAt: new Date()
    });
    
    const savedUser = await newUser.save();
    
    console.log('✅ User created in MongoDB:', {
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      id: savedUser._id
    });
    
    return savedUser;
    
  } catch (error) {
    console.error('Error migrating user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateUser();
