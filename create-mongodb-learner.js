import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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

const createLearnerUser = async () => {
  console.log('Creating learner user in MongoDB...\n');
  
  // Connect to MongoDB
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Define User schema if not already defined
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['learner', 'trainer', 'evaluator'], required: true },
      isVerified: { type: Boolean, default: true },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Create or get User model
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'amenityforges@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists in MongoDB:', {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        id: existingUser._id
      });
      
      // Generate JWT token for existing user
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      
      console.log('\n💡 Use this token in the frontend localStorage:');
      console.log(`localStorage.setItem('telugu-basics-token', '${token}');`);
      
      return existingUser;
    }
    
    // Create new user
    console.log('Creating new learner user...');
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds); // Change this to the actual password
    
    const newUser = new User({
      name: 'Shri yasasw',
      email: 'amenityforges@gmail.com',
      phone: '08341122402',
      password: hashedPassword,
      role: 'learner',
      isVerified: true,
      isActive: true
    });
    
    const savedUser = await newUser.save();
    
    console.log('✅ User created in MongoDB:', {
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      id: savedUser._id
    });
    
    // Generate JWT token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    console.log('\n💡 Use this token in the frontend localStorage:');
    console.log(`localStorage.setItem('telugu-basics-token', '${token}');`);
    
    return savedUser;
    
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createLearnerUser();
