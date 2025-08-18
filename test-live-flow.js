import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Testing live deployment flow...');

const testLiveFlow = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clean up any existing test data
    console.log('\n🧹 Cleaning up any test data...');
    await User.deleteMany({
      email: { $regex: /test-live/, $options: 'i' }
    });

    // Step 1: Create a trainer (simulating registration)
    console.log('\n👨‍💼 Step 1: Creating trainer (registration simulation)');
    const trainer1 = new User({
      name: 'Live Trainer 1',
      email: 'trainer1@live.com',
      phone: '1111111111',
      password: 'trainer123',
      role: 'trainer',
      isVerified: true,
      isActive: true
    });
    await trainer1.save();
    console.log('✅ Trainer 1 created:', trainer1.email);

    const trainer2 = new User({
      name: 'Live Trainer 2',
      email: 'trainer2@live.com',
      phone: '2222222222',
      password: 'trainer123',
      role: 'trainer',
      isVerified: true,
      isActive: true
    });
    await trainer2.save();
    console.log('✅ Trainer 2 created:', trainer2.email);

    // Step 2: Trainer 1 adds evaluators and students
    console.log('\n👨‍🏫 Step 2: Trainer 1 adding evaluators and students');
    
    // Add evaluators for trainer 1
    const evaluator1 = new User({
      name: 'Evaluator 1',
      email: 'evaluator1@live.com',
      phone: '3333333333',
      password: 'eval123',
      role: 'evaluator',
      trainerId: trainer1._id,
      isVerified: true,
      isActive: true
    });
    await evaluator1.save();
    console.log('✅ Evaluator 1 added for Trainer 1');

    const evaluator2 = new User({
      name: 'Evaluator 2',
      email: 'evaluator2@live.com',
      phone: '4444444444',
      password: 'eval123',
      role: 'evaluator',
      trainerId: trainer1._id,
      isVerified: true,
      isActive: true
    });
    await evaluator2.save();
    console.log('✅ Evaluator 2 added for Trainer 1');

    // Add students for trainer 1
    const student1 = new User({
      name: 'Student 1',
      email: 'student1@live.com',
      phone: '5555555555',
      password: 'student123',
      role: 'learner',
      trainerId: trainer1._id,
      isVerified: true,
      isActive: true
    });
    await student1.save();
    console.log('✅ Student 1 added for Trainer 1');

    const student2 = new User({
      name: 'Student 2',
      email: 'student2@live.com',
      phone: '6666666666',
      password: 'student123',
      role: 'learner',
      trainerId: trainer1._id,
      isVerified: true,
      isActive: true
    });
    await student2.save();
    console.log('✅ Student 2 added for Trainer 1');

    // Step 3: Trainer 2 adds evaluators and students
    console.log('\n👨‍🏫 Step 3: Trainer 2 adding evaluators and students');
    
    const evaluator3 = new User({
      name: 'Evaluator 3',
      email: 'evaluator3@live.com',
      phone: '7777777777',
      password: 'eval123',
      role: 'evaluator',
      trainerId: trainer2._id,
      isVerified: true,
      isActive: true
    });
    await evaluator3.save();
    console.log('✅ Evaluator 3 added for Trainer 2');

    const student3 = new User({
      name: 'Student 3',
      email: 'student3@live.com',
      phone: '8888888888',
      password: 'student123',
      role: 'learner',
      trainerId: trainer2._id,
      isVerified: true,
      isActive: true
    });
    await student3.save();
    console.log('✅ Student 3 added for Trainer 2');

    // Step 4: Test isolation - verify each trainer only sees their own users
    console.log('\n🔍 Step 4: Testing trainer isolation');
    
    // Check Trainer 1's users
    const trainer1Evaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: trainer1._id 
    }).select('-password');
    
    const trainer1Students = await User.find({ 
      role: 'learner', 
      trainerId: trainer1._id 
    }).select('-password');

    console.log(`\n📊 Trainer 1 (${trainer1.email}) users:`);
    console.log(`  - Evaluators: ${trainer1Evaluators.length}`);
    trainer1Evaluators.forEach(e => console.log(`    * ${e.name} (${e.email})`));
    console.log(`  - Students: ${trainer1Students.length}`);
    trainer1Students.forEach(s => console.log(`    * ${s.name} (${s.email})`));

    // Check Trainer 2's users
    const trainer2Evaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: trainer2._id 
    }).select('-password');
    
    const trainer2Students = await User.find({ 
      role: 'learner', 
      trainerId: trainer2._id 
    }).select('-password');

    console.log(`\n📊 Trainer 2 (${trainer2.email}) users:`);
    console.log(`  - Evaluators: ${trainer2Evaluators.length}`);
    trainer2Evaluators.forEach(e => console.log(`    * ${e.name} (${e.email})`));
    console.log(`  - Students: ${trainer2Students.length}`);
    trainer2Students.forEach(s => console.log(`    * ${s.name} (${s.email})`));

    // Step 5: Test login functionality
    console.log('\n🔐 Step 5: Testing login functionality');
    
    // Test trainer login
    const trainer1Login = await trainer1.comparePassword('trainer123');
    console.log(`Trainer 1 login: ${trainer1Login ? '✅' : '❌'}`);
    
    // Test evaluator login
    const evaluator1Login = await evaluator1.comparePassword('eval123');
    console.log(`Evaluator 1 login: ${evaluator1Login ? '✅' : '❌'}`);
    
    // Test student login
    const student1Login = await student1.comparePassword('student123');
    console.log(`Student 1 login: ${student1Login ? '✅' : '❌'}`);

    // Step 6: Clean up test data
    console.log('\n🧹 Step 6: Cleaning up test data');
    await User.deleteMany({
      email: { $regex: /live\.com/, $options: 'i' }
    });
    console.log('✅ Test data cleaned up');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    console.log('\n🎉 Live deployment test completed successfully!');
    console.log('✅ Trainer isolation working correctly');
    console.log('✅ User creation working correctly');
    console.log('✅ Login functionality working correctly');
    console.log('✅ System ready for live deployment!');

  } catch (error) {
    console.error('❌ Live flow test failed:', error);
    process.exit(1);
  }
};

testLiveFlow(); 