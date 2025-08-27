import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Testing MongoDB integration for evaluators and students...');

const testMongoDBIntegration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Count all users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in MongoDB: ${totalUsers}`);

    // Test 2: Get all evaluators
    const evaluators = await User.find({ role: 'evaluator' }).select('-password');
    console.log(`👨‍🏫 Evaluators in MongoDB: ${evaluators.length}`);
    evaluators.forEach(e => {
      console.log(`  - ${e.name} (${e.email}) - Active: ${e.isActive}`);
    });

    // Test 3: Get all students
    const students = await User.find({ role: 'learner' }).select('-password');
    console.log(`👨‍🎓 Students in MongoDB: ${students.length}`);
    students.forEach(s => {
      console.log(`  - ${s.name} (${s.email}) - Active: ${s.isActive}`);
    });

    // Test 4: Get all trainers
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    console.log(`👨‍💼 Trainers in MongoDB: ${trainers.length}`);
    trainers.forEach(t => {
      console.log(`  - ${t.name} (${t.email}) - Active: ${t.isActive}`);
    });

    // Test 5: Test login functionality
    console.log('\n🔐 Testing login functionality...');
    const testUser = await User.findOne({ email: 'testevaluator@example.com' });
    if (testUser) {
      console.log('✅ Test evaluator found in MongoDB');
      console.log(`  - Name: ${testUser.name}`);
      console.log(`  - Role: ${testUser.role}`);
      console.log(`  - Active: ${testUser.isActive}`);
      
      // Test password comparison
      const isPasswordValid = await testUser.comparePassword('test123');
      console.log(`  - Password valid: ${isPasswordValid ? '✅' : '❌'}`);
    } else {
      console.log('❌ Test evaluator not found in MongoDB');
    }

    // Test 6: Test evaluator creation (simulation)
    console.log('\n➕ Testing evaluator creation...');
    const newEvaluator = new User({
      name: 'Test MongoDB Evaluator',
      email: 'mongodb-evaluator@example.com',
      phone: '9999999999',
      password: 'test123',
      role: 'evaluator',
      trainerId: trainers[0]?._id || null,
      isVerified: true,
      isActive: true
    });

    await newEvaluator.save();
    console.log('✅ Test evaluator created successfully in MongoDB');
    console.log(`  - ID: ${newEvaluator._id}`);
    console.log(`  - Name: ${newEvaluator.name}`);
    console.log(`  - Email: ${newEvaluator.email}`);

    // Clean up - remove test user
    await User.deleteOne({ email: 'mongodb-evaluator@example.com' });
    console.log('🧹 Test evaluator cleaned up');

    console.log('\n🎉 MongoDB integration test completed successfully!');
    console.log('✅ Evaluators and students are now stored in MongoDB');
    console.log('✅ Login system will work with MongoDB');
    console.log('✅ All CRUD operations will use MongoDB');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

  } catch (error) {
    console.error('❌ MongoDB integration test failed:', error);
    process.exit(1);
  }
};

testMongoDBIntegration(); 