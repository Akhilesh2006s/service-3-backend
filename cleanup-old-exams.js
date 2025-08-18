import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from './models/Exam.js';

// Load environment variables
dotenv.config();

const cleanupOldExams = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('❌ MONGODB_URI not configured');
      return;
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all exams with closeDate
    const examsWithCloseDate = await Exam.find({ closeDate: { $exists: true } });
    console.log(`📋 Found ${examsWithCloseDate.length} exams with closeDate`);

    if (examsWithCloseDate.length === 0) {
      console.log('✅ No exams with closeDate found - database is clean!');
      return;
    }

    // Update each exam
    for (const exam of examsWithCloseDate) {
      console.log(`🔄 Processing exam: ${exam.title}`);
      
      // Calculate time limit from closeDate - openDate
      let descriptiveTimeLimit = 60; // default 60 minutes
      
      if (exam.openDate && exam.closeDate) {
        const openDate = new Date(exam.openDate);
        const closeDate = new Date(exam.closeDate);
        const timeDiffMs = closeDate.getTime() - openDate.getTime();
        const timeDiffMinutes = Math.ceil(timeDiffMs / (1000 * 60));
        
        // Set reasonable limits
        if (timeDiffMinutes > 0 && timeDiffMinutes <= 480) {
          descriptiveTimeLimit = timeDiffMinutes;
        }
      }

      // Update the exam
      await Exam.updateOne(
        { _id: exam._id },
        { 
          $set: { 
            descriptiveTimeLimit: descriptiveTimeLimit 
          },
          $unset: { 
            closeDate: 1 
          }
        }
      );

      console.log(`✅ Updated exam "${exam.title}" - removed closeDate, set timeLimit to ${descriptiveTimeLimit} minutes`);
    }

    console.log('🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

cleanupOldExams();
