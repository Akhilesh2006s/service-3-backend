import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

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

const generateTrainerToken = async () => {
  console.log('🔑 Generating Trainer Token...\n');
  
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Find the trainer user
    const trainer = await User.findOne({ role: 'trainer' });
    
    if (!trainer) {
      console.log('❌ No trainer user found');
      return;
    }
    
    console.log(`Found trainer: ${trainer.name} (${trainer.email})`);
    console.log(`User ID: ${trainer._id}`);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: trainer._id, role: trainer.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    console.log('\n✅ Generated Trainer Token:');
    console.log(token);
    console.log('\n💡 Use this token in the frontend localStorage:');
    console.log(`localStorage.setItem('telugu-basics-token', '${token}');`);
    
    return token;
    
  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    await mongoose.disconnect();
  }
};

generateTrainerToken();
