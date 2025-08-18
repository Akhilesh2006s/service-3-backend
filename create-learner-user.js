import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Creating learner user for testing...');

const createLearnerUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if learner already exists
    const existingLearner = await User.findOne({ email: 'learner@example.com' });
    
    if (existingLearner) {
      console.log('✅ Learner already exists:');
      console.log(`  - Name: ${existingLearner.name}`);
      console.log(`  - Email: ${existingLearner.email}`);
      console.log(`  - Role: ${existingLearner.role}`);
      
      // Reset password to known value
      existingLearner.password = 'learner123';
      await existingLearner.save();
      console.log('✅ Password reset to: learner123');
    } else {
      // Create new learner
      const learner = new User({
        name: 'Test Learner',
        email: 'learner@example.com',
        phone: '5555555556',
        password: 'learner123',
        role: 'learner',
        isVerified: true,
        isActive: true
      });

      await learner.save();
      console.log('✅ Learner created successfully:');
      console.log(`  - Name: ${learner.name}`);
      console.log(`  - Email: ${learner.email}`);
      console.log(`  - Role: ${learner.role}`);
    }

    // Test the learner's password
    const learner = await User.findOne({ email: 'learner@example.com' });
    const isPasswordValid = await learner.comparePassword('learner123');
    console.log(`Password test: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

    // List all learners
    console.log('\n📋 All learners in database:');
    const allLearners = await User.find({ role: 'learner' }).select('-password');
    allLearners.forEach(l => {
      console.log(`  - ${l.name} (${l.email}) - Active: ${l.isActive}`);
    });

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    console.log('\n🎉 Learner user ready!');
    console.log('💡 Login credentials:');
    console.log('   - Email: learner@example.com');
    console.log('   - Password: learner123');
    console.log('   - Role: learner');

  } catch (error) {
    console.error('❌ Learner creation failed:', error);
    process.exit(1);
  }
};

createLearnerUser();

