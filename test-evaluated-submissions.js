import mongoose from 'mongoose';
import Submission from './models/Submission.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkEvaluatedSubmissions = async () => {
  try {
    console.log('🔍 Checking evaluated submissions...');
    
    // Find all submissions
    const allSubmissions = await Submission.find({}).populate('student', 'name email');
    console.log(`📊 Total submissions found: ${allSubmissions.length}`);
    
    // Find evaluated submissions
    const evaluatedSubmissions = await Submission.find({ status: 'evaluated' }).populate('student', 'name email');
    console.log(`✅ Evaluated submissions found: ${evaluatedSubmissions.length}`);
    
    // Log details of each evaluated submission
    evaluatedSubmissions.forEach((submission, index) => {
      console.log(`\n📋 Evaluated Submission ${index + 1}:`);
      console.log(`   ID: ${submission._id}`);
      console.log(`   Student: ${submission.student?.name || 'Unknown'}`);
      console.log(`   Type: ${submission.submissionType}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Score: ${submission.score}`);
      console.log(`   Feedback: ${submission.feedback ? submission.feedback.substring(0, 50) + '...' : 'No feedback'}`);
      console.log(`   Tags: ${submission.tags?.join(', ') || 'No tags'}`);
      console.log(`   Submitted: ${submission.submittedAt}`);
      console.log(`   Evaluation: ${submission.evaluation ? 'Present' : 'Missing'}`);
    });
    
    // Find voice submissions specifically
    const voiceSubmissions = await Submission.find({ submissionType: 'voice' }).populate('student', 'name email');
    console.log(`\n🎤 Voice submissions found: ${voiceSubmissions.length}`);
    
    voiceSubmissions.forEach((submission, index) => {
      console.log(`\n🎤 Voice Submission ${index + 1}:`);
      console.log(`   ID: ${submission._id}`);
      console.log(`   Student: ${submission.student?.name || 'Unknown'}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Score: ${submission.score}`);
      console.log(`   Milestone: ${submission.milestone}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking submissions:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkEvaluatedSubmissions();
  process.exit(0);
};

main();
