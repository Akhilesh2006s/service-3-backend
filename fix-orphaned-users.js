import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Fixing orphaned users...');

const fixOrphanedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all trainers
    const trainers = await User.find({ role: 'trainer' });
    console.log(`Found ${trainers.length} trainers`);

    if (trainers.length === 0) {
      console.log('❌ No trainers found. Cannot assign orphaned users.');
      return;
    }

    // Get orphaned evaluators and students
    const orphanedEvaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: { $exists: false } 
    });

    const orphanedStudents = await User.find({ 
      role: 'learner', 
      trainerId: { $exists: false } 
    });

    console.log(`Found ${orphanedEvaluators.length} orphaned evaluators`);
    console.log(`Found ${orphanedStudents.length} orphaned students`);

    // Assign orphaned users to the first trainer
    const defaultTrainer = trainers[0];
    console.log(`Assigning orphaned users to: ${defaultTrainer.name} (${defaultTrainer.email})`);

    let updatedCount = 0;

    // Update orphaned evaluators
    for (const evaluator of orphanedEvaluators) {
      evaluator.trainerId = defaultTrainer._id;
      await evaluator.save();
      console.log(`✅ Assigned evaluator: ${evaluator.name} (${evaluator.email})`);
      updatedCount++;
    }

    // Update orphaned students
    for (const student of orphanedStudents) {
      student.trainerId = defaultTrainer._id;
      await student.save();
      console.log(`✅ Assigned student: ${student.name} (${student.email})`);
      updatedCount++;
    }

    console.log(`\n✅ Fixed ${updatedCount} orphaned users`);

    // Verify the fix
    console.log('\n🔍 Verification:');
    const remainingOrphanedEvaluators = await User.find({ 
      role: 'evaluator', 
      trainerId: { $exists: false } 
    });
    
    const remainingOrphanedStudents = await User.find({ 
      role: 'learner', 
      trainerId: { $exists: false } 
    });

    console.log(`Remaining orphaned evaluators: ${remainingOrphanedEvaluators.length}`);
    console.log(`Remaining orphaned students: ${remainingOrphanedStudents.length}`);

    // Show trainer assignments
    console.log('\n📊 Current trainer assignments:');
    for (const trainer of trainers) {
      const trainerEvaluators = await User.find({ 
        role: 'evaluator', 
        trainerId: trainer._id 
      });
      
      const trainerStudents = await User.find({ 
        role: 'learner', 
        trainerId: trainer._id 
      });
      
      console.log(`\n${trainer.name} (${trainer.email}):`);
      console.log(`  - Evaluators: ${trainerEvaluators.length}`);
      trainerEvaluators.forEach(e => console.log(`    * ${e.name} (${e.email})`));
      console.log(`  - Students: ${trainerStudents.length}`);
      trainerStudents.forEach(s => console.log(`    * ${s.name} (${s.email})`));
    }

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    console.log('\n🎉 Orphaned users fixed successfully!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
};

fixOrphanedUsers(); 