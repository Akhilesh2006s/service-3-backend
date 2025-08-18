import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getAllUsers } from './utils/userStorage.js';

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

const checkUsers = async () => {
  console.log('Checking users in MongoDB vs in-memory storage...\n');
  
  // Connect to MongoDB
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Get MongoDB users
    const User = mongoose.model('User');
    const mongoUsers = await User.find({}).select('-password');
    console.log(`MongoDB users count: ${mongoUsers.length}`);
    
    mongoUsers.forEach(user => {
      console.log(`- MongoDB User: ${user.name} (${user._id}) - Role: ${user.role}`);
    });
    
    // Get in-memory users
    const memoryUsers = getAllUsers();
    console.log(`\nIn-memory users count: ${memoryUsers.length}`);
    
    memoryUsers.forEach(user => {
      console.log(`- Memory User: ${user.name} (${user._id}) - Role: ${user.role}`);
    });
    
    // Check for matching users
    console.log('\nChecking for matching users...');
    const matchingUsers = mongoUsers.filter(mongoUser => 
      memoryUsers.some(memoryUser => 
        mongoUser.email === memoryUser.email || 
        mongoUser.phone === memoryUser.phone
      )
    );
    
    console.log(`Matching users: ${matchingUsers.length}`);
    matchingUsers.forEach(user => {
      console.log(`- Matching: ${user.name} (${user._id}) - Role: ${user.role}`);
    });
    
    // Check for learner users specifically
    const mongoLearners = mongoUsers.filter(u => u.role === 'learner');
    const memoryLearners = memoryUsers.filter(u => u.role === 'learner');
    
    console.log(`\nLearner users:`);
    console.log(`- MongoDB learners: ${mongoLearners.length}`);
    mongoLearners.forEach(user => {
      console.log(`  * ${user.name} (${user._id}) - ${user.email}`);
    });
    
    console.log(`- Memory learners: ${memoryLearners.length}`);
    memoryLearners.forEach(user => {
      console.log(`  * ${user.name} (${user._id}) - ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUsers();
