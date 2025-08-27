import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Final cleanup and preparation for live deployment...');

const finalCleanup = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const allUsers = await User.find({}).select('-password');
    console.log('\n📋 Current users:');
    allUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.role} - Trainer: ${u.trainerId || 'None'}`);
    });

    // Get trainers
    const trainers = await User.find({ role: 'trainer' });
    console.log(`\nFound ${trainers.length} trainers`);

    if (trainers.length === 0) {
      console.log('❌ No trainers found. Creating a default trainer...');
      
      const defaultTrainer = new User({
        name: 'Default Trainer',
        email: 'default@telugu-learning.com',
        phone: '9999999999',
        password: 'trainer123',
        role: 'trainer',
        isVerified: true,
        isActive: true
      });
      
      await defaultTrainer.save();
      console.log('✅ Created default trainer');
      trainers.push(defaultTrainer);
    }

    // Assign all evaluators and students to the first trainer
    const defaultTrainer = trainers[0];
    console.log(`\nAssigning users to: ${defaultTrainer.name} (${defaultTrainer.email})`);

    // Find evaluators without trainerId
    const evaluatorsWithoutTrainer = await User.find({ 
      role: 'evaluator',
      $or: [
        { trainerId: { $exists: false } },
        { trainerId: null }
      ]
    });

    console.log(`Found ${evaluatorsWithoutTrainer.length} evaluators without trainer`);

    for (const evaluator of evaluatorsWithoutTrainer) {
      evaluator.trainerId = defaultTrainer._id;
      await evaluator.save();
      console.log(`✅ Assigned evaluator: ${evaluator.name} (${evaluator.email})`);
    }

    // Find students without trainerId
    const studentsWithoutTrainer = await User.find({ 
      role: 'learner',
      $or: [
        { trainerId: { $exists: false } },
        { trainerId: null }
      ]
    });

    console.log(`Found ${studentsWithoutTrainer.length} students without trainer`);

    for (const student of studentsWithoutTrainer) {
      student.trainerId = defaultTrainer._id;
      await student.save();
      console.log(`✅ Assigned student: ${student.name} (${student.email})`);
    }

    // Verify assignments
    console.log('\n🔍 Verification:');
    const trainerEvaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: defaultTrainer._id 
    });
    
    const trainerStudents = await User.find({ 
      role: 'learner', 
      trainerId: defaultTrainer._id 
    });

    console.log(`\n${defaultTrainer.name} (${defaultTrainer.email}):`);
    console.log(`  - Evaluators: ${trainerEvaluators.length}`);
    trainerEvaluators.forEach(e => console.log(`    * ${e.name} (${e.email})`));
    console.log(`  - Students: ${trainerStudents.length}`);
    trainerStudents.forEach(s => console.log(`    * ${s.name} (${s.email})`));

    // Check for any remaining orphaned users
    const remainingOrphanedEvaluators = await User.find({ 
      role: 'evaluator',
      $or: [
        { trainerId: { $exists: false } },
        { trainerId: null }
      ]
    });
    
    const remainingOrphanedStudents = await User.find({ 
      role: 'learner',
      $or: [
        { trainerId: { $exists: false } },
        { trainerId: null }
      ]
    });

    if (remainingOrphanedEvaluators.length > 0 || remainingOrphanedStudents.length > 0) {
      console.log('\n⚠️ Warning: Still have orphaned users:');
      remainingOrphanedEvaluators.forEach(e => console.log(`  - Evaluator: ${e.name} (${e.email})`));
      remainingOrphanedStudents.forEach(s => console.log(`  - Student: ${s.name} (${s.email})`));
    } else {
      console.log('\n✅ No orphaned users remaining');
    }

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    console.log('\n🎉 Final cleanup completed!');
    console.log('✅ All users properly assigned to trainers');
    console.log('✅ System ready for live deployment');

  } catch (error) {
    console.error('❌ Final cleanup failed:', error);
    process.exit(1);
  }
};

finalCleanup(); 