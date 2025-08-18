import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './models/Submission.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing MongoDB connection and submissions...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

const testMongoDB = async () => {
  const isConnected = await connectDB();
  
  if (!isConnected) {
    console.log('❌ Cannot proceed without MongoDB connection');
    return;
  }

  try {
    // Check existing submissions
    const existingSubmissions = await Submission.find({ submissionType: 'voice' });
    console.log(`📋 Found ${existingSubmissions.length} existing voice submissions in MongoDB`);
    
    if (existingSubmissions.length > 0) {
      console.log('📋 Existing submissions:', existingSubmissions.map(s => ({ id: s._id, student: s.student, milestone: s.milestone })));
    }

    // Create a test voice submission in MongoDB
    const testSubmission = new Submission({
      student: '507f1f77bcf86cd799439011', // Example user ID
      type: 'milestone',
      submissionType: 'voice',
      milestone: 1,
      voiceRecording: {
        audioBlob: 'mongodb-test-audio-data',
        duration: 20,
        fileName: 'mongodb-test-recording.wav',
        submittedAt: new Date()
      },
      stepTitle: 'Telugu Basics - Lesson 1: Vowels',
      lessonId: 'lesson-1',
      lessonTitle: 'Telugu Basics - Lesson 1: Vowels (అ నుండి అహా వరకు)',
      status: 'pending',
      submittedAt: new Date()
    });

    const savedSubmission = await testSubmission.save();
    console.log('✅ Created MongoDB submission:', savedSubmission._id);

    // Check all voice submissions again
    const allVoiceSubmissions = await Submission.find({ submissionType: 'voice' });
    console.log(`📋 Total voice submissions in MongoDB: ${allVoiceSubmissions.length}`);
    console.log('📋 All voice submissions:', allVoiceSubmissions.map(s => ({ id: s._id, student: s.student, milestone: s.milestone })));

  } catch (error) {
    console.error('❌ Error working with MongoDB submissions:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

testMongoDB();
