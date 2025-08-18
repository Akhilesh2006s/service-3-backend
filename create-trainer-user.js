import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Creating trainer user for testing...');

const createTrainerUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if trainer already exists
    const existingTrainer = await User.findOne({ email: 'trainer@example.com' });
    
    if (existingTrainer) {
      console.log('✅ Trainer already exists:');
      console.log(`  - Name: ${existingTrainer.name}`);
      console.log(`  - Email: ${existingTrainer.email}`);
      console.log(`  - Role: ${existingTrainer.role}`);
      
      // Reset password to known value
      existingTrainer.password = 'trainer123';
      await existingTrainer.save();
      console.log('✅ Password reset to: trainer123');
    } else {
      // Create new trainer
      const trainer = new User({
        name: 'Test Trainer',
        email: 'trainer@example.com',
        phone: '5555555555',
        password: 'trainer123',
        role: 'trainer',
        isVerified: true,
        isActive: true
      });

      await trainer.save();
      console.log('✅ Trainer created successfully:');
      console.log(`  - Name: ${trainer.name}`);
      console.log(`  - Email: ${trainer.email}`);
      console.log(`  - Role: ${trainer.role}`);
    }

    // Test the trainer's password
    const trainer = await User.findOne({ email: 'trainer@example.com' });
    const isPasswordValid = await trainer.comparePassword('trainer123');
    console.log(`Password test: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

    // List all trainers
    console.log('\n📋 All trainers in database:');
    const allTrainers = await User.find({ role: 'trainer' }).select('-password');
    allTrainers.forEach(t => {
      console.log(`  - ${t.name} (${t.email}) - Active: ${t.isActive}`);
    });

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    console.log('\n🎉 Trainer user ready!');
    console.log('💡 Login credentials:');
    console.log('   - Email: trainer@example.com');
    console.log('   - Password: trainer123');
    console.log('   - Role: trainer');

  } catch (error) {
    console.error('❌ Trainer creation failed:', error);
    process.exit(1);
  }
};

createTrainerUser(); 