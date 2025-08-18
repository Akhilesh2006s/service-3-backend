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

const checkDescriptiveExam = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Checking descriptive exam...\n');
    
    // Find the descriptive exam
    const exam = await Exam.findOne({ 
      type: 'descriptive',
      title: 's'
    });
    
    if (!exam) {
      console.log('❌ Descriptive exam not found');
      return;
    }
    
    console.log('📊 Descriptive Exam Details:');
    console.log(`ID: ${exam._id}`);
    console.log(`Title: ${exam.title}`);
    console.log(`Description: ${exam.description}`);
    console.log(`Type: ${exam.type}`);
    console.log(`Is Published: ${exam.isPublished}`);
    console.log(`Is Active: ${exam.isActive}`);
    console.log(`Open Date: ${exam.openDate}`);
    console.log(`Time Limit: ${exam.descriptiveTimeLimit} minutes`);
    console.log(`MCQ Questions: ${exam.mcqQuestions ? exam.mcqQuestions.length : 0}`);
    console.log(`Voice Questions: ${exam.voiceQuestions ? exam.voiceQuestions.length : 0}`);
    console.log(`Descriptive Questions: ${exam.descriptiveQuestions ? exam.descriptiveQuestions.length : 0}`);
    
    if (exam.descriptiveQuestions && exam.descriptiveQuestions.length > 0) {
      console.log('\n📝 Descriptive Questions:');
      exam.descriptiveQuestions.forEach((q, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log(`  Question: ${q.question}`);
        console.log(`  Instructions: ${q.instructions}`);
        console.log(`  Max Points: ${q.maxPoints}`);
        console.log(`  Word Limit: ${q.wordLimit || 'No limit'}`);
      });
    } else {
      console.log('\n❌ No descriptive questions found!');
      console.log('This is why you see "No Questions Available"');
    }
    
    // Check if the exam has the required fields for descriptive exams
    console.log('\n🔧 Exam Configuration Check:');
    console.log(`Has Open Date: ${!!exam.openDate}`);
    console.log(`Has Time Limit: ${!!exam.descriptiveTimeLimit}`);
    console.log(`Has Questions: ${exam.descriptiveQuestions && exam.descriptiveQuestions.length > 0}`);
    
    if (!exam.openDate) {
      console.log('⚠️  Missing: openDate (required for descriptive exams)');
    }
    if (!exam.descriptiveTimeLimit) {
      console.log('⚠️  Missing: descriptiveTimeLimit (required for descriptive exams)');
    }
    if (!exam.descriptiveQuestions || exam.descriptiveQuestions.length === 0) {
      console.log('⚠️  Missing: descriptiveQuestions (required for descriptive exams)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking descriptive exam:', error);
    process.exit(1);
  }
};

checkDescriptiveExam();



