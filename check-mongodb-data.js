import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

const checkMongoDBData = async () => {
  console.log('Checking MongoDB data...\n');
  
  // Connect to MongoDB
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Check Users collection
    const users = await User.find({}).select('-password');
    console.log(`📊 Users in database: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check Exams collection
    const exams = await Exam.find({});
    console.log(`\n📊 Exams in database: ${exams.length}`);
    exams.forEach(exam => {
      console.log(`  - ${exam.title} - Type: ${exam.type} - Published: ${exam.isPublished} - Active: ${exam.isActive}`);
    });
    
    // Check Submissions collection
    const submissions = await Submission.find({});
    console.log(`\n📊 Submissions in database: ${submissions.length}`);
    submissions.forEach(submission => {
      console.log(`  - Student: ${submission.student} - Type: ${submission.type} - Status: ${submission.status}`);
    });
    
    // Check for published exams specifically
    const publishedExams = await Exam.find({ isPublished: true, isActive: true });
    console.log(`\n📊 Published and active exams: ${publishedExams.length}`);
    
    if (publishedExams.length === 0) {
      console.log('\n💡 No published exams found. This is why you\'re getting "Failed to fetch exams"');
      console.log('   The exams endpoint only returns published and active exams.');
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkMongoDBData();
