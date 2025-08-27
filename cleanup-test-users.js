import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Cleaning up test users for live deployment...');

const cleanupTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // List all users before cleanup
    console.log('\n📋 Current users in database:');
    const allUsers = await User.find({}).select('-password');
    allUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.role} - Active: ${u.isActive}`);
    });

    // Remove test users (emails containing 'test', 'example', or specific test emails)
    const testEmails = [
      'test@example.com',
      'testuser@example.com',
      'testevaluator@example.com',
      'trainer@example.com',
      'ak@gmail.com', // This was a test user
      '1@gmail.com', // Test evaluator
      'test123@example.com',
      'mongodb-evaluator@example.com'
    ];

    console.log('\n🧹 Removing test users...');
    let removedCount = 0;
    
    for (const email of testEmails) {
      const user = await User.findOne({ email });
      if (user) {
        await User.deleteOne({ email });
        console.log(`  ✅ Removed: ${user.name} (${email})`);
        removedCount++;
      }
    }

    // Also remove users with test patterns in email
    const testPatternUsers = await User.find({
      email: { $regex: /test|example|temp|demo/, $options: 'i' }
    });

    for (const user of testPatternUsers) {
      await User.deleteOne({ _id: user._id });
      console.log(`  ✅ Removed: ${user.name} (${user.email})`);
      removedCount++;
    }

    console.log(`\n✅ Cleanup completed! Removed ${removedCount} test users.`);

    // List remaining users
    console.log('\n📋 Remaining users in database:');
    const remainingUsers = await User.find({}).select('-password');
    if (remainingUsers.length === 0) {
      console.log('  ℹ️ No users remaining - ready for live deployment!');
    } else {
      remainingUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - ${u.role} - Active: ${u.isActive}`);
      });
    }

    // Verify the system is ready
    console.log('\n🔍 System verification:');
    
    // Check if we have any trainers
    const trainers = await User.find({ role: 'trainer' });
    console.log(`  - Trainers: ${trainers.length}`);
    
    // Check if we have any evaluators
    const evaluators = await User.find({ role: 'evaluator' });
    console.log(`  - Evaluators: ${evaluators.length}`);
    
    // Check if we have any students
    const students = await User.find({ role: 'learner' });
    console.log(`  - Students: ${students.length}`);

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    console.log('\n🎉 Database cleaned and ready for live deployment!');
    console.log('💡 Next steps:');
    console.log('   1. Trainers can register at /register');
    console.log('   2. Trainers can login and add their evaluators/students');
    console.log('   3. Each trainer will only see their own users');
    console.log('   4. All users can login with their credentials');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
};

cleanupTestUsers(); 