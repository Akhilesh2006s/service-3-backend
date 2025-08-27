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

const debugExamQuestions = async () => {
  console.log('🔍 Debugging Exam Questions...\n');
  
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Find all exams
    const exams = await Exam.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${exams.length} exams in database:\n`);
    
    exams.forEach((exam, index) => {
      console.log(`${index + 1}. Exam: "${exam.title}"`);
      console.log(`   ID: ${exam._id}`);
      console.log(`   Type: ${exam.type}`);
      console.log(`   Published: ${exam.isPublished}`);
      console.log(`   Created: ${exam.createdAt}`);
      console.log(`   Created By: ${exam.createdBy}`);
      
      // Check MCQ Questions
      if (exam.mcqQuestions && exam.mcqQuestions.length > 0) {
        console.log(`   MCQ Questions: ${exam.mcqQuestions.length}`);
        exam.mcqQuestions.forEach((q, qIndex) => {
          console.log(`     Q${qIndex + 1}: ${q.question.substring(0, 50)}...`);
        });
      } else {
        console.log(`   MCQ Questions: 0`);
      }
      
      // Check Descriptive Questions
      if (exam.descriptiveQuestions && exam.descriptiveQuestions.length > 0) {
        console.log(`   Descriptive Questions: ${exam.descriptiveQuestions.length}`);
        exam.descriptiveQuestions.forEach((q, qIndex) => {
          console.log(`     Q${qIndex + 1}: ${q.question.substring(0, 50)}...`);
          console.log(`       Instructions: ${q.instructions ? q.instructions.substring(0, 30) + '...' : 'None'}`);
          console.log(`       Max Points: ${q.maxPoints}`);
          console.log(`       Word Limit: ${q.wordLimit || 'None'}`);
        });
      } else {
        console.log(`   Descriptive Questions: 0`);
      }
      
      // Check Voice Questions
      if (exam.voiceQuestions && exam.voiceQuestions.length > 0) {
        console.log(`   Voice Questions: ${exam.voiceQuestions.length}`);
      } else {
        console.log(`   Voice Questions: 0`);
      }
      
      console.log(''); // Empty line for readability
    });
    
    // Check specifically for the "vsd" exam
    const vsdExam = await Exam.findOne({ title: 'vsd' });
    if (vsdExam) {
      console.log('🎯 Found "vsd" exam:');
      console.log(`   ID: ${vsdExam._id}`);
      console.log(`   Type: ${vsdExam.type}`);
      console.log(`   Published: ${vsdExam.isPublished}`);
      console.log(`   Descriptive Questions Count: ${vsdExam.descriptiveQuestions ? vsdExam.descriptiveQuestions.length : 0}`);
      
      if (vsdExam.descriptiveQuestions && vsdExam.descriptiveQuestions.length > 0) {
        console.log('   Questions:');
        vsdExam.descriptiveQuestions.forEach((q, index) => {
          console.log(`     Q${index + 1}: ${q.question}`);
          console.log(`       Instructions: ${q.instructions}`);
          console.log(`       Max Points: ${q.maxPoints}`);
          console.log(`       Word Limit: ${q.wordLimit}`);
        });
      } else {
        console.log('   ❌ No descriptive questions found in database');
      }
    } else {
      console.log('❌ "vsd" exam not found in database');
    }
    
  } catch (error) {
    console.error('Error debugging exams:', error);
  } finally {
    await mongoose.disconnect();
  }
};

debugExamQuestions();
