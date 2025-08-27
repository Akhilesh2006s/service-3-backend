import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import LearningActivity from '../models/LearningActivity.js';
import Exam from '../models/Exam.js';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for setup');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Create sample admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@telugu-learning.com',
      phone: '+1234567890',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample trainer
    const trainerUser = new User({
      name: 'Telugu Trainer',
      email: 'trainer@telugu-learning.com',
      phone: '+1234567891',
      password: 'trainer123',
      role: 'trainer',
      isVerified: true,
      trainerProfile: {
        specialization: 'Telugu Language Teaching'
      }
    });
    await trainerUser.save();
    console.log('✅ Trainer user created');

    // Create sample evaluator
    const evaluatorUser = new User({
      name: 'Speech Evaluator',
      email: 'evaluator@telugu-learning.com',
      phone: '+1234567892',
      password: 'evaluator123',
      role: 'evaluator',
      isVerified: true,
      evaluatorProfile: {
        specialization: 'Speech Evaluation'
      }
    });
    await evaluatorUser.save();
    console.log('✅ Evaluator user created');

    // Create sample learning activities
    const sampleActivities = [
      {
        title: 'Telugu Vowels - Part 1',
        teluguTitle: 'తెలుగు అచ్చులు - భాగం 1',
        description: 'Learn the basic Telugu vowels (అ, ఆ, ఇ, ఈ, ఉ, ఊ)',
        type: 'video',
        category: 'vowels',
        difficulty: 'beginner',
        milestone: 1,
        order: 1,
        duration: 15,
        videoUrl: 'https://example.com/video1.mp4',
        videoThumbnail: 'https://example.com/thumbnail1.jpg',
        videoDuration: 900,
        tags: ['vowels', 'beginner', 'pronunciation'],
        createdBy: trainerUser._id,
        isPublished: true
      },
      {
        title: 'Basic Telugu Numbers',
        teluguTitle: 'ప్రాథమిక తెలుగు సంఖ్యలు',
        description: 'Learn to count from 1 to 10 in Telugu',
        type: 'practice',
        category: 'numbers',
        difficulty: 'beginner',
        milestone: 1,
        order: 2,
        duration: 20,
        practiceContent: 'Practice counting: ఒక్కటి, ఇద్దరు, ముగ్దరు...',
        practiceInstructions: 'Repeat each number after the audio',
        tags: ['numbers', 'counting', 'beginner'],
        createdBy: trainerUser._id,
        isPublished: true
      },
      {
        title: 'Telugu Consonants - Ka Series',
        teluguTitle: 'తెలుగు హల్లులు - క శ్రేణి',
        description: 'Learn the Ka series consonants (క, ఖ, గ, ఘ, ఙ)',
        type: 'video',
        category: 'consonants',
        difficulty: 'beginner',
        milestone: 2,
        order: 1,
        duration: 18,
        videoUrl: 'https://example.com/video2.mp4',
        videoThumbnail: 'https://example.com/thumbnail2.jpg',
        videoDuration: 1080,
        tags: ['consonants', 'ka-series', 'pronunciation'],
        createdBy: trainerUser._id,
        isPublished: true
      }
    ];

    for (const activityData of sampleActivities) {
      const activity = new LearningActivity(activityData);
      await activity.save();
    }
    console.log('✅ Sample learning activities created');

    // Create sample exam
    const sampleExam = new Exam({
      title: 'Basic Telugu Assessment',
      description: 'Test your knowledge of basic Telugu vowels and numbers',
      type: 'mixed',
      category: 'comprehensive',
      difficulty: 'beginner',
      milestone: 1,
      timeLimit: 30,
      passingScore: 70,
      mcqQuestions: [
        {
          question: 'Which of the following is a Telugu vowel?',
          options: ['క', 'అ', 'గ', 'ఘ'],
          correctAnswer: 1,
          explanation: 'అ (a) is a Telugu vowel'
        },
        {
          question: 'How do you say "one" in Telugu?',
          options: ['ఇద్దరు', 'ఒక్కటి', 'ముగ్దరు', 'నాలుగు'],
          correctAnswer: 1,
          explanation: 'ఒక్కటి means "one" in Telugu'
        }
      ],
      voiceQuestions: [
        {
          question: 'Please pronounce the vowel "అ"',
          targetWords: ['అ'],
          instructions: 'Say the vowel clearly and hold it for 2 seconds'
        }
      ],
      questionDistribution: {
        mcq: 2,
        voice: 1
      },
      createdBy: trainerUser._id,
      isPublished: true
    });

    await sampleExam.save();
    console.log('✅ Sample exam created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nSample users created:');
    console.log('- Admin: admin@telugu-learning.com / admin123');
    console.log('- Trainer: trainer@telugu-learning.com / trainer123');
    console.log('- Evaluator: evaluator@telugu-learning.com / evaluator123');

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

const setupDatabase = async () => {
  try {
    await connectDB();
    await createSampleData();
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

setupDatabase(); 