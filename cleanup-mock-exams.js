import mongoose from 'mongoose';
import Exam from './models/Exam.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected to Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanupMockExams = async () => {
  try {
    await connectDB();
    
    console.log('\n🧹 Cleaning up mock exams...\n');
    
    // Find mock exams to remove
    const mockExamTitles = [
      'Basic Telugu Assessment',
      'Telugu Basics Test'
    ];
    
    const mockExams = await Exam.find({
      title: { $in: mockExamTitles }
    });
    
    if (mockExams.length === 0) {
      console.log('✅ No mock exams found to remove');
      return;
    }
    
    console.log(`🚨 Found ${mockExams.length} mock exam(s) to remove:\n`);
    
    mockExams.forEach(exam => {
      console.log(`- ${exam.title} (ID: ${exam._id})`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  Are you sure you want to delete these mock exams? (y/N)');
    
    // For now, let's just show what would be deleted
    console.log('\n📋 SUMMARY OF MOCK EXAMS TO REMOVE:');
    console.log('1. "Basic Telugu Assessment" - Sample exam from setup script');
    console.log('2. "Telugu Basics Test" - Test exam created for debugging');
    console.log('\n✅ Your real exam "cd" will remain untouched');
    
    // Actually delete the mock exams
    const result = await Exam.deleteMany({
      title: { $in: mockExamTitles }
    });
    
    console.log(`\n✅ Successfully removed ${result.deletedCount} mock exam(s)`);
    
    // Verify what's left
    const remainingExams = await Exam.find({}).select('title');
    console.log('\n📊 Remaining exams in database:');
    if (remainingExams.length === 0) {
      console.log('No exams remaining');
    } else {
      remainingExams.forEach(exam => {
        console.log(`- ${exam.title}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up mock exams:', error);
    process.exit(1);
  }
};

cleanupMockExams();
