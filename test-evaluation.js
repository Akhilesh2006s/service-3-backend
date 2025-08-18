import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Submission from './models/Submission.js';
import Exam from './models/Exam.js';

dotenv.config();

const testEvaluation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a descriptive submission
    const submission = await Submission.findOne({ 
      submissionType: 'descriptive',
      status: 'pending'
    }).populate('exam');

    if (!submission) {
      console.log('❌ No pending descriptive submissions found');
      return;
    }

    console.log('📝 Found submission:', {
      id: submission._id,
      examTitle: submission.exam?.title,
      examMaxMarks: submission.exam?.totalMaxMarks,
      status: submission.status,
      student: submission.student?.name
    });

    // Test the evaluation API
    const testEvaluation = {
      overallScore: 85,
      feedback: "Great work! Well done."
    };

    console.log('🧪 Testing evaluation data:', testEvaluation);

    // Check if exam has max marks
    if (submission.exam?.totalMaxMarks) {
      console.log(`✅ Exam max marks: ${submission.exam.totalMaxMarks}`);
    } else {
      console.log('⚠️ Exam has no totalMaxMarks field');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testEvaluation();
