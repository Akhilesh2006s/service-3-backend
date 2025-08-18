import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from './models/Exam.js';

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

const checkFrontendData = async () => {
  console.log('🔍 Checking Frontend Data...\n');
  
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Get all exams (like the frontend would)
    const exams = await Exam.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${exams.length} exams:\n`);
    
    exams.forEach((exam, index) => {
      console.log(`Exam ${index + 1}: "${exam.title}"`);
      console.log(`  Type: ${exam.type}`);
      console.log(`  Published: ${exam.isPublished}`);
      
      // Calculate question counts (like frontend should do)
      const mcqCount = exam.mcqQuestions ? exam.mcqQuestions.length : 0;
      const descriptiveCount = exam.descriptiveQuestions ? exam.descriptiveQuestions.length : 0;
      const voiceCount = exam.voiceQuestions ? exam.voiceQuestions.length : 0;
      const totalCount = mcqCount + descriptiveCount + voiceCount;
      
      console.log(`  MCQ Questions: ${mcqCount}`);
      console.log(`  Descriptive Questions: ${descriptiveCount}`);
      console.log(`  Voice Questions: ${voiceCount}`);
      console.log(`  TOTAL Questions: ${totalCount}`);
      
      // Show what the frontend should display
      console.log(`  🎯 Frontend should show: "${totalCount} Questions"`);
      
      if (totalCount === 0) {
        console.log(`  ❌ PROBLEM: Frontend showing "0 Questions" but should show "${totalCount}"`);
      } else {
        console.log(`  ✅ CORRECT: Frontend should show "${totalCount} Questions"`);
      }
      
      console.log('');
    });
    
    // Check specifically for exam "d"
    const examD = await Exam.findOne({ title: 'd' });
    if (examD) {
      console.log('🎯 Specific check for exam "d":');
      console.log(`  MCQ: ${examD.mcqQuestions ? examD.mcqQuestions.length : 0}`);
      console.log(`  Descriptive: ${examD.descriptiveQuestions ? examD.descriptiveQuestions.length : 0}`);
      console.log(`  Voice: ${examD.voiceQuestions ? examD.voiceQuestions.length : 0}`);
      
      const total = (examD.mcqQuestions ? examD.mcqQuestions.length : 0) + 
                   (examD.descriptiveQuestions ? examD.descriptiveQuestions.length : 0) + 
                   (examD.voiceQuestions ? examD.voiceQuestions.length : 0);
      
      console.log(`  Total: ${total}`);
      console.log(`  Frontend should show: "${total} Questions"`);
      
      if (total === 0) {
        console.log('  ❌ Frontend showing "0 Questions" is CORRECT');
      } else {
        console.log('  ❌ Frontend showing "0 Questions" is WRONG - should show "' + total + ' Questions"');
      }
    }
    
  } catch (error) {
    console.error('Error checking frontend data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkFrontendData();
