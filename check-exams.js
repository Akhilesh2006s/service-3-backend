import mongoose from 'mongoose';
import Exam from './models/Exam.js';
import User from './models/User.js';
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

const checkExams = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Checking all exams in database...\n');
    
    // Get all exams
    const exams = await Exam.find({}).populate('createdBy', 'name email role');
    
    if (exams.length === 0) {
      console.log('📭 No exams found in database');
      return;
    }
    
    console.log(`📊 Found ${exams.length} exam(s) in database:\n`);
    
    exams.forEach((exam, index) => {
      console.log(`--- Exam ${index + 1} ---`);
      console.log(`ID: ${exam._id}`);
      console.log(`Title: ${exam.title}`);
      console.log(`Description: ${exam.description}`);
      console.log(`Type: ${exam.type}`);
      console.log(`Category: ${exam.category}`);
      console.log(`Difficulty: ${exam.difficulty}`);
      console.log(`Milestone: ${exam.milestone}`);
      console.log(`Time Limit: ${exam.timeLimit} minutes`);
      console.log(`Is Published: ${exam.isPublished}`);
      console.log(`Is Active: ${exam.isActive}`);
      console.log(`Created By: ${exam.createdBy ? exam.createdBy.name : 'Unknown'} (${exam.createdBy ? exam.createdBy.role : 'Unknown Role'})`);
      console.log(`Created At: ${exam.createdAt}`);
      console.log(`MCQ Questions: ${exam.mcqQuestions ? exam.mcqQuestions.length : 0}`);
      console.log(`Voice Questions: ${exam.voiceQuestions ? exam.voiceQuestions.length : 0}`);
      console.log('');
    });
    
    // Check for mock/sample exams
    const mockExams = exams.filter(exam => 
      exam.title.toLowerCase().includes('basic') || 
      exam.title.toLowerCase().includes('sample') ||
      exam.title.toLowerCase().includes('test') ||
      exam.description.toLowerCase().includes('sample') ||
      exam.description.toLowerCase().includes('test')
    );
    
    if (mockExams.length > 0) {
      console.log('🚨 POTENTIAL MOCK EXAMS FOUND:');
      mockExams.forEach(exam => {
        console.log(`- ${exam.title} (ID: ${exam._id})`);
      });
      console.log('');
    }
    
    // Check trainers
    console.log('👥 Trainers in database:');
    const trainers = await User.find({ role: 'trainer' }).select('name email');
    trainers.forEach(trainer => {
      console.log(`- ${trainer.name} (${trainer.email})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking exams:', error);
    process.exit(1);
  }
};

checkExams();



