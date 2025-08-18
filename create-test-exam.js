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
      console.log('Please set MONGODB_URI in your .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected to Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestExam = async () => {
  try {
    await connectDB();
    
    // Find or create a trainer user
    let trainer = await User.findOne({ role: 'trainer' });
    if (!trainer) {
      trainer = new User({
        name: 'Test Trainer',
        email: 'trainer@test.com',
        phone: '1234567890',
        password: 'trainer123',
        role: 'trainer'
      });
      await trainer.save();
      console.log('✅ Test trainer created');
    }
    
    // Create a test exam
    const testExam = new Exam({
      title: 'Telugu Basics Test',
      description: 'A simple test to check your Telugu knowledge',
      type: 'mcq',
      category: 'comprehensive',
      difficulty: 'beginner',
      milestone: 1,
      timeLimit: 15,
      passingScore: 70,
      mcqQuestions: [
        {
          question: 'Which of the following is a Telugu vowel?',
          options: ['క', 'అ', 'గ', 'ఘ'],
          correctAnswer: 1,
          explanation: 'అ (a) is a Telugu vowel',
          points: 1
        },
        {
          question: 'How do you say "one" in Telugu?',
          options: ['ఇద్దరు', 'ఒక్కటి', 'ముగ్దరు', 'నాలుగు'],
          correctAnswer: 1,
          explanation: 'ఒక్కటి means "one" in Telugu',
          points: 1
        },
        {
          question: 'What is the Telugu word for "water"?',
          options: ['నీరు', 'అన్నం', 'పాలు', 'చెరకు'],
          correctAnswer: 0,
          explanation: 'నీరు means "water" in Telugu',
          points: 1
        }
      ],
      isActive: true,
      isPublished: true,
      allowRetakes: true,
      maxAttempts: 3,
      createdBy: trainer._id
    });
    
    await testExam.save();
    console.log('✅ Test exam created:', testExam.title);
    console.log('Exam ID:', testExam._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test exam:', error);
    process.exit(1);
  }
};

createTestExam();


